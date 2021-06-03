import { BehaviorSubject, isObservable, Observable, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, map, pluck, take, takeUntil } from 'rxjs/operators';
import { Entries, getUniqueId } from '../util';
import { isArray, isNil, isNotNil, isObjectEmpty, isString, uniq, uniqBy } from 'st-utils';
import { ControlUpdateOn } from '../control-update-on';
import { AbstractControl, AbstractControlOptions } from '../abstract-control';
import { KeyValue } from '@angular/common';
import { ControlGroup } from '../control-group/control-group';
import { ControlValidator } from '../validator/validator';
import { ValidatorsModel } from '../validator/validators';

export interface ControlOptions<T = any, M = any> extends AbstractControlOptions<M> {
  validators?: ControlValidator[];
  initialFocus?: boolean;
}

export interface ControlUpdateOptions {
  emitChange?: boolean;
  /** @internal */
  emitInternalValue$?: boolean;
}

function controlUpdateOptions(options?: ControlUpdateOptions): ControlUpdateOptions {
  return { emitChange: true, emitInternalValue$: true, ...options };
}

function isControlValidator(value: ControlOptions | ControlValidator | undefined): value is ControlValidator {
  return !!(value as ControlValidator)?.name;
}

export interface ControlState {
  disabled: boolean;
  enabled: boolean;
  pristine: boolean;
  dirty: boolean;
  touched: boolean;
  untouched: boolean;
  valid: boolean;
  invalid: boolean;
  pending: boolean;
}

function toControlOptions(options: ControlOptions | ControlValidator | ControlValidator[] | undefined): ControlOptions {
  let newOptions: ControlOptions = { updateOn: 'change' };
  if (isArray(options)) {
    newOptions.validators = options;
  } else if (isControlValidator(options)) {
    newOptions.validators = [options];
  } else if (options) {
    newOptions = { ...newOptions, ...options };
  }
  return newOptions;
}

export class Control<T = any, M = any> implements AbstractControl<T, M> {
  constructor(value: T, options?: ControlOptions<T, M> | ControlValidator<T> | ControlValidator<T>[]) {
    this._initialValue = value;
    this._initialOptions = toControlOptions(options);
    this._updateOn = this._initialOptions.updateOn!;
    this._initialFocus = this._initialOptions.initialFocus ?? false;
    this.metadata = this._initialOptions.metadata;
    if (this._initialOptions.disabled) {
      this._disabled = this._initialOptions.disabled;
    }
    this._setInitialValidators(this._initialOptions.validators);
    this._value$ = new BehaviorSubject<T>(value);
    this.internalValueChanges$.next(value);
    this.value$ = this._value$.asObservable();
    this._valueChanges$.next(value);
    this.init();
  }

  private readonly _initialValue: T;
  private readonly _initialOptions: ControlOptions<T>;
  private readonly _validatorsMap = new Map<keyof ValidatorsModel, ControlValidator>();
  private readonly _disabledChanged$ = new BehaviorSubject<void>(undefined);
  private readonly _stateChanged$ = new Subject<ControlState>();
  private readonly _value$: BehaviorSubject<T>;
  private readonly _valueChanges$ = new Subject<T>();
  private readonly _attributesChanged$ = new Subject<Record<string, string>>();
  private readonly _classesChanged$ = new Subject<string[]>();
  private readonly _submit$ = new Subject<void>();
  private readonly _errors$ = new BehaviorSubject<Partial<ValidatorsModel>>({});
  private readonly _initialFocus: boolean;

  private _parent: ControlGroup | undefined;
  private _dirty = false;
  private _touched = false;
  private _invalid = false;
  private _pending = 0;
  private _disabled = false;
  private _updateOn: ControlUpdateOn;

  readonly errors$ = this._errors$.asObservable();
  readonly errorList$: Observable<KeyValue<keyof ValidatorsModel, ValidatorsModel[keyof ValidatorsModel]>[]> =
    this.errors$.pipe(
      map(errors => (Object.entries(errors) as Entries<ValidatorsModel>).map(([key, value]) => ({ key, value })))
    );
  readonly hasErrors$ = this.errors$.pipe(map(errors => !isObjectEmpty(errors)));
  readonly validationCancel: Record<keyof ValidatorsModel, Subject<void>> = {};
  readonly disabledChanged$ = this._disabledChanged$.asObservable();
  readonly stateChanged$ = this._stateChanged$.asObservable();
  readonly value$: Observable<T>;
  readonly valueChanges$ = this._valueChanges$.asObservable();
  readonly uniqueId = getUniqueId();

  /** @internal */
  readonly internalValueChanges$ = new Subject<T>();
  /** @internal */
  readonly attributesChanged$ = this._attributesChanged$.asObservable();
  /** @internal */
  readonly classesChanged$ = this._classesChanged$.asObservable();
  /** @internal */
  readonly submit$ = this._submit$.asObservable();

  metadata?: M;

  get parent(): ControlGroup | undefined {
    return this._parent;
  }
  /** @internal */
  set parent(parent: ControlGroup | undefined) {
    this._parent = parent;
  }

  get pristine(): boolean {
    return !this.dirty;
  }

  get dirty(): boolean {
    return this._dirty;
  }

  get touched(): boolean {
    return this._touched;
  }

  get untouched(): boolean {
    return !this.touched;
  }

  get invalid(): boolean {
    return this._invalid;
  }

  get valid(): boolean {
    return !this.invalid;
  }

  get pending(): boolean {
    return !!this._pending;
  }

  get disabled(): boolean {
    return this._disabled;
  }

  get enabled(): boolean {
    return !this.disabled;
  }

  /** @internal */
  set updateOn(updateOn: ControlUpdateOn) {
    this._updateOn = updateOn;
  }
  /** @internal */
  get updateOn(): ControlUpdateOn {
    return this._updateOn;
  }

  /** @internal */
  get initialFocus(): boolean {
    return this._initialFocus;
  }

  get value(): T {
    return this._value$.value;
  }

  get validators(): (keyof ValidatorsModel)[] {
    return [...this._validatorsMap.keys()];
  }

  private _setInitialValidators(validators: ControlValidator[] = []): this {
    this._validatorsMap.clear();
    for (const validator of validators) {
      if (validator.async) {
        this.validationCancel[validator.name] = new Subject<void>();
      }
      this._validatorsMap.set(validator.name, validator);
    }
    return this;
  }

  private _sendClasses(): this {
    const classes = [...this._validatorsMap.values()].reduce((acc: string[], validator) => {
      if (isString(validator.classes)) {
        acc.push(validator.classes);
      } else if (isArray(validator.classes)) {
        acc.push(...validator.classes);
      }
      return acc;
    }, []);
    this._classesChanged$.next(uniq(classes));
    return this;
  }

  private _sendAttributes(): this {
    const attrs = [...this._validatorsMap.values()].reduce((acc, validator) => ({ ...acc, ...validator.attrs }), {});
    this._attributesChanged$.next(attrs);
    return this;
  }

  private _sendAttributesAndClasses(): this {
    return this._sendAttributes()._sendClasses();
  }

  private _stateChanged(): this {
    this._stateChanged$.next(this.getState());
    return this;
  }

  private _addPending(): this {
    this._pending++;
    return this._stateChanged();
  }

  private _removePending(): this {
    this._pending = Math.max(this._pending - 1, 0);
    return this._stateChanged();
  }

  private _emitChange(value: T, options?: ControlUpdateOptions): this {
    options = controlUpdateOptions(options);
    if (options.emitChange) {
      this._valueChanges$.next(value);
    }
    if (options.emitInternalValue$) {
      this.internalValueChanges$.next(value);
    }
    return this;
  }

  private _cancelPendingValidation(name: keyof ValidatorsModel): this {
    this.validationCancel[name].next();
    return this._removePending();
  }

  private _getValidationError(validator: ControlValidator): Observable<any> | any | undefined {
    if (validator.async) {
      this._cancelPendingValidation(validator.name);
    }
    return validator.validate(this);
  }

  /** @internal */
  init(): this {
    this._sendAttributesAndClasses();
    if (this._initialOptions.disabled) {
      this.disable(this._initialOptions.disabled);
    }
    return this.runValidators();
  }

  /** @internal */
  setUpdateOn(updateOn?: ControlUpdateOn): this {
    if (updateOn) {
      this.updateOn = updateOn;
    }
    return this;
  }

  markAsTouched(touched = true): this {
    if (this._touched !== touched) {
      this._touched = touched;
      this._stateChanged();
    }
    return this;
  }

  markAsDirty(dirty = true): this {
    if (this._dirty !== dirty) {
      this._dirty = dirty;
      this._stateChanged();
    }
    return this;
  }

  markAsInvalid(invalid = true): this {
    if (this._invalid !== invalid) {
      this._invalid = invalid;
      this._stateChanged();
    }
    return this;
  }

  setValidator(validator: ControlValidator): this {
    if (this._validatorsMap.has(validator.name)) {
      return this;
    }
    this._validatorsMap.set(validator.name, validator);
    if (validator.async) {
      this.validationCancel[validator.name] = new Subject<void>();
    }
    return this._sendAttributesAndClasses().runValidator(validator.name);
  }

  setValidators(validators: ControlValidator[]): this {
    validators = uniqBy(
      validators.filter(validator => !this._validatorsMap.has(validator.name)),
      'name'
    );
    if (!validators.length) {
      return this;
    }
    for (const validator of validators) {
      this._validatorsMap.set(validator.name, validator);
      if (validator.async) {
        this.validationCancel[validator.name] = new Subject<void>();
      }
    }
    return this._sendAttributesAndClasses().runValidators(validators.map(validator => validator.name));
  }

  getState(): ControlState {
    const { dirty, touched, pristine, untouched, disabled, enabled, invalid, pending, valid } = this;
    return { dirty, disabled, enabled, invalid, pending, pristine, touched, untouched, valid };
  }

  removeValidator(name: keyof ValidatorsModel): this {
    if (this._validatorsMap.has(name)) {
      if (this.pending) {
        this._cancelPendingValidation(name);
      }
      if (this.hasError(name)) {
        this.removeError(name);
      }
      this._validatorsMap.delete(name);
      this._sendAttributesAndClasses();
    }
    return this;
  }

  removeValidators(names: (keyof ValidatorsModel)[]): this {
    names = names.filter(name => this._validatorsMap.has(name));
    if (!names.length) {
      return this;
    }
    for (const name of names) {
      if (this.pending) {
        this._cancelPendingValidation(name);
      }
      if (this.hasError(name)) {
        this.removeError(name);
      }
      this._validatorsMap.delete(name);
    }
    return this._sendAttributesAndClasses();
  }

  hasValidator(name: keyof ValidatorsModel): boolean {
    return this._validatorsMap.has(name);
  }

  hasValidators(names: (keyof ValidatorsModel)[]): boolean {
    return names.some(name => this.hasValidator(name));
  }

  hasAnyValidators(): boolean {
    return !!this._validatorsMap.size;
  }

  setValue(value: T, options?: ControlUpdateOptions): this {
    if (value !== this.value) {
      this._value$.next(value);
      this._emitChange(value, options).runValidators();
    }
    return this;
  }

  patchValue(value: T, options?: ControlUpdateOptions): this {
    return this.setValue(value, options);
  }

  runValidator(name: keyof ValidatorsModel): this {
    const validator = this._validatorsMap.get(name);
    if (!validator) {
      return this;
    }
    const validationError = this._getValidationError(validator);
    if (isObservable(validationError)) {
      this._addPending();
      validationError
        .pipe(
          take(1),
          takeUntil(this.validationCancel[name]),
          catchError(() => {
            this._removePending();
            return of(null);
          })
        )
        .subscribe(error => {
          this._removePending();
          if (isNil(error)) {
            this.removeError(name);
          } else {
            this.addError(name, error);
          }
        });
    } else {
      if (isNil(validationError)) {
        this.removeError(name);
      } else {
        this.addError(name, validationError);
      }
    }
    return this;
  }

  runValidators(names?: (keyof ValidatorsModel)[]): this {
    names ??= this.validators;
    for (const validator of names) {
      this.runValidator(validator);
    }
    return this;
  }

  hasAnyError(): boolean {
    return !!this.getErrors();
  }

  hasError(name: keyof ValidatorsModel): boolean {
    return isNotNil(this._errors$.value[name]);
  }

  hasErrors(names: (keyof ValidatorsModel)[]): boolean {
    const errors = this.getErrors();
    return !!errors && names.some(name => isNotNil(errors[name]));
  }

  getError<K extends keyof ValidatorsModel>(name: K): ValidatorsModel[K] | undefined {
    return this._errors$.value[name];
  }

  getErrors(): Partial<ValidatorsModel> | null {
    const errors = this._errors$.value;
    if (isObjectEmpty(errors)) {
      return null;
    } else {
      return errors;
    }
  }

  selectHasError(name: keyof ValidatorsModel): Observable<boolean> {
    return this.selectError(name).pipe(map(error => isNil(error)));
  }

  selectError<K extends keyof ValidatorsModel>(name: K): Observable<ValidatorsModel[K] | undefined> {
    return this.errors$.pipe(pluck(name), distinctUntilChanged());
  }

  updateError(callback: (state: Partial<ValidatorsModel>) => Partial<ValidatorsModel>): this {
    const newErrors = callback(this._errors$.value);
    this._invalid = !isObjectEmpty(newErrors);
    this._errors$.next(newErrors);
    return this._stateChanged();
  }

  removeError(name: keyof ValidatorsModel): this {
    return this.updateError(state => Object.fromEntries(Object.entries(state).filter(([key]) => key !== name)));
  }

  addError<K extends keyof ValidatorsModel>(name: K, error: ValidatorsModel[K]): this {
    return this.updateError(state => ({ ...state, [name]: error }));
  }

  disable(disabled = true): this {
    this._disabled = disabled;
    this._disabledChanged$.next();
    return this._stateChanged();
  }

  enable(enable = true): this {
    return this.disable(!enable);
  }

  reset(): this {
    this._setInitialValidators(this._initialOptions.validators);
    this._errors$.next({});
    this.setValue(this._initialValue);
    this._dirty = false;
    this._touched = false;
    this._disabled = !!this._initialOptions.disabled;
    this._disabledChanged$.next();
    return this._stateChanged();
  }

  /** @internal */
  submit(): this {
    this._submit$.next();
    return this;
  }
}

export function isControl(value: any): value is Control {
  return value instanceof Control;
}
