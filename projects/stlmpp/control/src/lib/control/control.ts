import { BehaviorSubject, isObservable, Observable, of, Subject } from 'rxjs';
import { catchError, distinctUntilChanged, map, pluck, take, takeUntil } from 'rxjs/operators';
import { Entries } from '../util';
import { isArray, isNil, isString, uniq, uniqBy } from '@stlmpp/utils';
import { ControlUpdateOn } from '../control-update-on';
import { AbstractControl, AbstractControlOptions } from '../abstract-control';
import { KeyValue } from '@angular/common';
import { isObjectEmpty } from '@stlmpp/utils';
import { ControlGroup } from '../control-group/control-group';
import { ControlValidator } from '../validator/validator';
import { ValidatorsModel } from '../validator/validators';

export interface ControlOptions<T = any> extends AbstractControlOptions {
  validators?: ControlValidator[];
}

export interface ControlUpdateOptions {
  emitChange?: boolean;
  /** @internal */
  __emit__value$?: boolean;
}

function controlUpdateOptions(options?: ControlUpdateOptions): ControlUpdateOptions {
  return { emitChange: true, __emit__value$: true, ...options };
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

export class Control<T = any> implements AbstractControl<T> {
  constructor(value?: T | null | undefined, options?: ControlOptions<T>);
  constructor(value?: T | null | undefined, options?: ControlValidator<T>);
  constructor(value?: T | null | undefined, options?: ControlValidator<T>[]);
  constructor(value?: T | null | undefined, options?: ControlOptions<T> | ControlValidator<T> | ControlValidator<T>[]) {
    this._initialValue = value;
    this._initialOptions = toControlOptions(options);
    this._updateOn = this._initialOptions.updateOn!;
    if (this._initialOptions.disabled) {
      this._disabled = this._initialOptions.disabled;
    }
    this.setInitialValidators(this._initialOptions.validators);
    this._value$ = new BehaviorSubject<T | null | undefined>(value);
    this.__value$.next(value);
    this.value$ = this._value$.asObservable();
    this._valueChanges$.next(value);
  }

  private readonly _initialValue: T | null | undefined;
  private readonly _initialOptions: ControlOptions<T>;
  private readonly _validatorsMap = new Map<keyof ValidatorsModel, ControlValidator>();

  private _errors$ = new BehaviorSubject<Partial<ValidatorsModel>>({});
  readonly errors$ = this._errors$.asObservable();
  readonly errorList$: Observable<
    KeyValue<keyof ValidatorsModel, ValidatorsModel[keyof ValidatorsModel]>[]
  > = this.errors$.pipe(
    map(errors => (Object.entries(errors) as Entries<ValidatorsModel>).map(([key, value]) => ({ key, value })))
  );
  readonly hasErrors$ = this.errors$.pipe(map(errors => !isObjectEmpty(errors)));
  readonly validationCancel: Record<keyof ValidatorsModel, Subject<void>> = {};

  private readonly _disabledChanged$ = new BehaviorSubject<void>(undefined);
  private readonly _stateChanged$ = new Subject<ControlState>();
  readonly disabledChanged$ = this._disabledChanged$.asObservable();
  readonly stateChanged$ = this._stateChanged$.asObservable();

  private readonly _value$: BehaviorSubject<T | null | undefined>;
  readonly value$: Observable<T | null | undefined>;
  private readonly _valueChanges$ = new Subject<T | null | undefined>();
  readonly valueChanges$ = this._valueChanges$.asObservable();

  /** @internal */
  readonly __value$ = new Subject<T | null | undefined>();

  private readonly _attributesChanged$ = new Subject<Record<string, string>>();
  private readonly _classesChanged$ = new Subject<string[]>();

  /** @internal */
  readonly attributesChanged$ = this._attributesChanged$.asObservable();
  /** @internal */
  readonly classesChanged$ = this._classesChanged$.asObservable();

  private readonly _submit$ = new Subject();
  /** @internal */
  readonly submit$ = this._submit$.asObservable();

  get parent(): ControlGroup | null | undefined {
    return this._parent;
  }
  /** @internal */
  set parent(parent: ControlGroup | null | undefined) {
    this._parent = parent;
  }
  private _parent: ControlGroup | null | undefined;

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

  private _dirty = false;
  private _touched = false;
  private _invalid = false;
  private _pending = 0;
  private _disabled = false;

  /** @internal */
  set updateOn(updateOn: ControlUpdateOn) {
    this._updateOn = updateOn;
  }
  /** @internal */
  get updateOn(): ControlUpdateOn {
    return this._updateOn;
  }
  private _updateOn!: ControlUpdateOn;

  get value(): T | null | undefined {
    return this._value$.value;
  }

  get validators(): (keyof ValidatorsModel)[] {
    return [...this._validatorsMap.keys()];
  }

  private setInitialValidators(validators: ControlValidator[] = []): void {
    this._validatorsMap.clear();
    for (const validator of validators) {
      if (validator.async) {
        this.validationCancel[validator.name] = new Subject();
      }
      this._validatorsMap.set(validator.name, validator);
    }
  }

  /** @internal */
  init(): void {
    this.sendAttributesAndClasses();
    if (this._initialOptions.disabled) {
      this.disable(this._initialOptions.disabled);
    }
    this.runValidators();
  }

  /** @internal */
  setUpdateOn(updateOn?: ControlUpdateOn): void {
    if (updateOn) {
      this.updateOn = updateOn;
    }
  }

  markAsTouched(touched = true): void {
    if (this._touched !== touched) {
      this._touched = touched;
      this.stateChanged();
    }
  }

  markAsDirty(dirty = true): void {
    if (this._dirty !== dirty) {
      this._dirty = dirty;
      this.stateChanged();
    }
  }

  markAsInvalid(invalid = true): void {
    if (this._invalid !== invalid) {
      this._invalid = invalid;
      this.stateChanged();
    }
  }

  private sendClasses(): void {
    const classes = [...this._validatorsMap.values()].reduce((acc: string[], validator) => {
      if (isString(validator.classes)) {
        acc.push(validator.classes);
      } else if (isArray(validator.classes)) {
        acc.push(...validator.classes);
      }
      return acc;
    }, []);
    this._classesChanged$.next(uniq(classes));
  }

  private sendAttributes(): void {
    const attrs = [...this._validatorsMap.values()].reduce((acc, validator) => {
      return { ...acc, ...validator.attrs };
    }, {});
    this._attributesChanged$.next(attrs);
  }

  private sendAttributesAndClasses(): void {
    this.sendAttributes();
    this.sendClasses();
  }

  setValidator(validator: ControlValidator): void {
    if (this._validatorsMap.has(validator.name)) {
      return;
    }
    this._validatorsMap.set(validator.name, validator);
    if (validator.async) {
      this.validationCancel[validator.name] = new Subject();
    }
    this.sendAttributesAndClasses();
    this.runValidator(validator.name);
  }

  setValidators(validators: ControlValidator[]): void {
    validators = uniqBy(
      validators.filter(validator => !this._validatorsMap.has(validator.name)),
      'name'
    );
    if (!validators.length) {
      return;
    }
    for (const validator of validators) {
      this._validatorsMap.set(validator.name, validator);
      if (validator.async) {
        this.validationCancel[validator.name] = new Subject();
      }
    }
    this.sendAttributesAndClasses();
    this.runValidators(validators.map(validator => validator.name));
  }

  getState(): ControlState {
    const { dirty, touched, pristine, untouched, disabled, enabled, invalid, pending, valid } = this;
    return { dirty, disabled, enabled, invalid, pending, pristine, touched, untouched, valid };
  }

  private stateChanged(): void {
    this._stateChanged$.next(this.getState());
  }

  private addPending(): void {
    this._pending++;
    this.stateChanged();
  }

  private removePending(): void {
    this._pending = Math.max(this._pending - 1, 0);
    this.stateChanged();
  }

  removeValidator(name: keyof ValidatorsModel): void {
    if (this._validatorsMap.has(name)) {
      if (this.pending) {
        this.cancelPendingValidation(name);
      }
      if (this.hasError(name)) {
        this.removeError(name);
      }
      this._validatorsMap.delete(name);
      this.sendAttributesAndClasses();
    }
  }

  removeValidators(names: (keyof ValidatorsModel)[]): void {
    names = names.filter(name => this._validatorsMap.has(name));
    if (!names.length) {
      return;
    }
    for (const name of names) {
      if (this.pending) {
        this.cancelPendingValidation(name);
      }
      if (this.hasError(name)) {
        this.removeError(name);
      }
      this._validatorsMap.delete(name);
    }
    this.sendAttributesAndClasses();
  }

  private _emitChange(value: T | null | undefined, options?: ControlUpdateOptions): void {
    options = controlUpdateOptions(options);
    if (options.emitChange) {
      this._valueChanges$.next(value);
    }
    if (options.__emit__value$) {
      this.__value$.next(value);
    }
  }

  setValue(value: T | null | undefined, options?: ControlUpdateOptions): void {
    this._value$.next(value);
    this._emitChange(value, options);
    this.runValidators();
  }

  patchValue(value: T | null | undefined, options?: ControlUpdateOptions): void {
    this.setValue(value, options);
  }

  private cancelPendingValidation(name: keyof ValidatorsModel): void {
    this.validationCancel[name].next();
    this.removePending();
  }

  private getValidationError(validator: ControlValidator): Observable<any> | any | undefined {
    if (validator.async) {
      this.cancelPendingValidation(validator.name);
    }
    return validator.validate(this);
  }

  runValidator(name: keyof ValidatorsModel): void {
    const validator = this._validatorsMap.get(name);
    if (!validator) {
      return;
    }
    const validationError = this.getValidationError(validator);
    if (isObservable(validationError)) {
      this.addPending();
      validationError
        .pipe(
          take(1),
          takeUntil(this.validationCancel[name]),
          catchError(() => {
            this.removePending();
            return of(null);
          })
        )
        .subscribe(error => {
          this.removePending();
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
  }

  runValidators(names?: (keyof ValidatorsModel)[]): void {
    names ??= this.validators;
    for (const validator of names) {
      this.runValidator(validator);
    }
  }

  hasErrors(): boolean {
    return !!this.getErrors();
  }

  hasError(name: keyof ValidatorsModel): boolean {
    return !isNil(this._errors$.value[name]);
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

  updateError(callback: (state: Partial<ValidatorsModel>) => Partial<ValidatorsModel>): void {
    const newErrors = callback(this._errors$.value);
    this._invalid = !isObjectEmpty(newErrors);
    this._errors$.next(newErrors);
    this.stateChanged();
  }

  removeError(name: keyof ValidatorsModel): void {
    this.updateError(state => Object.fromEntries(Object.entries(state).filter(([key]) => key !== name)));
  }

  addError<K extends keyof ValidatorsModel>(name: K, error: ValidatorsModel[K]): void {
    this.updateError(state => ({ ...state, [name]: error }));
  }

  disable(disabled = true): void {
    this._disabled = disabled;
    this._disabledChanged$.next();
    this.stateChanged();
  }

  enable(enable = true): void {
    this.disable(!enable);
  }

  reset(): void {
    this.setInitialValidators(this._initialOptions.validators);
    this._errors$.next({});
    this.setValue(this._initialValue);
    this._dirty = false;
    this._touched = false;
    this._disabled = !!this._initialOptions.disabled;
    this._disabledChanged$.next();
    this.stateChanged();
  }

  /** @internal */
  submit(): void {
    this._submit$.next();
  }
}
