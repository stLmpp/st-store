import {
  BehaviorSubject,
  catchError,
  distinctUntilChanged,
  isObservable,
  map,
  Observable,
  of,
  pluck,
  Subject,
  take,
  takeUntil,
} from 'rxjs';
import { Entries, getUniqueId } from '../util';
import { isArray, isKeyof, isNil, isNotNil, isObjectEmpty, isString, uniq, uniqBy } from 'st-utils';
import { ControlUpdateOn } from '../control-update-on';
import { AbstractControl, AbstractControlOptions } from '../abstract-control';
import { KeyValue } from '@angular/common';
import { ControlGroup } from '../control-group/control-group';
import { ControlValidator } from '../validator/validator';
import { ValidatorsKeys, ValidatorsModel } from '../validator/validators';

export interface ControlOptions<T = any, M = any> extends AbstractControlOptions<M> {
  validators?: ControlValidator[];
  initialFocus?: boolean;
}

export interface ControlUpdateOptions {
  emitChange?: boolean;
  /** @internal */
  emitInternalValue$?: boolean;
}

interface ControlValidatorMap {
  validator: ControlValidator;
  cancelPending: Subject<void>;
  destroy: Subject<void>;
}

function controlUpdateOptions(options?: ControlUpdateOptions): ControlUpdateOptions {
  return { emitChange: true, emitInternalValue$: true, ...options };
}

function isControlValidator(value: ControlOptions | ControlValidator | undefined): value is ControlValidator {
  return !!(value as ControlValidator)?.name;
}

function resolveValidatorName(nameOrValidator: ValidatorsKeys | ControlValidator): ValidatorsKeys {
  return isKeyof<ValidatorsModel, ValidatorsKeys>(nameOrValidator) ? nameOrValidator : nameOrValidator.name;
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
  private readonly _disabledChanged$ = new BehaviorSubject<void>(undefined);
  private readonly _stateChanged$ = new Subject<ControlState>();
  private readonly _value$: BehaviorSubject<T>;
  private readonly _valueChanges$ = new Subject<T>();
  private readonly _attributesChanged$ = new Subject<Record<string, string>>();
  private readonly _classesChanged$ = new Subject<string[]>();
  private readonly _submit$ = new Subject<void>();
  private readonly _errors$ = new BehaviorSubject<Partial<ValidatorsModel>>({});
  private readonly _initialFocus: boolean;
  private readonly _validatorsMap = new Map<ValidatorsKeys, ControlValidatorMap>();

  private _parent: ControlGroup | undefined;
  private _dirty = false;
  private _touched = false;
  private _invalid = false;
  private _pending = 0;
  private _disabled = false;
  private _updateOn: ControlUpdateOn;

  readonly errors$ = this._errors$.asObservable();
  readonly errorList$: Observable<KeyValue<ValidatorsKeys, ValidatorsModel[ValidatorsKeys]>[]> = this.errors$.pipe(
    map(errors => (Object.entries(errors) as Entries<ValidatorsModel>).map(([key, value]) => ({ key, value })))
  );
  readonly hasErrors$ = this.errors$.pipe(map(errors => !isObjectEmpty(errors)));
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

  get validators(): ValidatorsKeys[] {
    return [...this._validatorsMap.keys()];
  }

  private _setInitialValidators(validators: ControlValidator[] = []): this {
    this._validatorsMap.clear();
    for (const validator of validators) {
      const validatorMap: ControlValidatorMap = { validator, destroy: new Subject(), cancelPending: new Subject() };
      this._validatorsMap.set(validator.name, validatorMap);
      this._listenToValidatorChanges(validatorMap);
    }
    return this;
  }

  private _sendClasses(): this {
    const classes = [...this._validatorsMap.values()].reduce((acc: string[], { validator }) => {
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
    const attrs = [...this._validatorsMap.values()].reduce(
      (acc, { validator }) => ({ ...acc, ...validator.attrs }),
      {}
    );
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

  private _cancelPendingValidation(validator: ControlValidatorMap): this {
    validator.cancelPending.next();
    return this._removePending();
  }

  private _getValidationError(validator: ControlValidatorMap): Observable<any> | any | undefined {
    if (validator.validator.async) {
      this._cancelPendingValidation(validator);
    }
    return validator.validator.validate(this);
  }

  private _removeValidator(nameOrValidator: ValidatorsKeys | ControlValidator, sendAttrAndClasses = true): this {
    const name = resolveValidatorName(nameOrValidator);
    const validator = this._validatorsMap.get(name);
    if (validator) {
      if (this.pending) {
        this._cancelPendingValidation(validator);
      }
      validator.cancelPending.complete();
      validator.destroy.next();
      validator.destroy.complete();
      if (this.hasError(name)) {
        this.removeError(name);
      }
      this._validatorsMap.delete(name);
      if (sendAttrAndClasses) {
        this._sendAttributesAndClasses();
      }
    }
    return this;
  }

  private _listenToValidatorChanges(validator: ControlValidatorMap): this {
    validator.validator.validationChange$.pipe(takeUntil(validator.destroy)).subscribe(() => {
      this.runValidator(validator.validator);
    });
    return this;
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
    const validatorMap: ControlValidatorMap = { validator, cancelPending: new Subject(), destroy: new Subject() };
    this._validatorsMap.set(validator.name, validatorMap);
    this._listenToValidatorChanges(validatorMap);
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
      const validatorMap: ControlValidatorMap = {
        validator,
        cancelPending: new Subject<void>(),
        destroy: new Subject(),
      };
      this._validatorsMap.set(validator.name, validatorMap);
      this._listenToValidatorChanges(validatorMap);
    }
    return this._sendAttributesAndClasses().runValidators(validators.map(validator => validator.name));
  }

  getState(): ControlState {
    const { dirty, touched, pristine, untouched, disabled, enabled, invalid, pending, valid } = this;
    return { dirty, disabled, enabled, invalid, pending, pristine, touched, untouched, valid };
  }

  removeValidator(nameOrValidator: ValidatorsKeys | ControlValidator): this {
    return this._removeValidator(nameOrValidator);
  }

  removeValidators(namesOrValidators: Array<ValidatorsKeys | ControlValidator>): this {
    const names = namesOrValidators.map(resolveValidatorName).filter(name => this._validatorsMap.has(name));
    if (!names.length) {
      return this;
    }
    for (const name of names) {
      this._removeValidator(name, false);
    }
    return this._sendAttributesAndClasses();
  }

  hasValidator(nameOrValidator: ValidatorsKeys | ControlValidator): boolean {
    const name = isKeyof<ValidatorsModel, ValidatorsKeys>(nameOrValidator) ? nameOrValidator : nameOrValidator.name;
    return this._validatorsMap.has(name);
  }

  hasValidators(namesOrValidators: Array<ValidatorsKeys | ControlValidator>): boolean {
    return namesOrValidators.some(nameOrValidator => this.hasValidator(nameOrValidator));
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

  runValidator(nameOrValidator: ValidatorsKeys | ControlValidator): this {
    const name = resolveValidatorName(nameOrValidator);
    const validator = this._validatorsMap.get(name);
    if (!validator?.validator) {
      return this;
    }
    const validationError = this._getValidationError(validator);
    if (isObservable(validationError)) {
      this._addPending();
      validationError
        .pipe(
          take(1),
          takeUntil(validator.cancelPending),
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

  runValidators(names?: Array<ValidatorsKeys | ControlValidator>): this {
    names ??= this.validators;
    for (const validator of names) {
      this.runValidator(validator);
    }
    return this;
  }

  hasAnyError(): boolean {
    return !!this.getErrors();
  }

  hasError(nameOrValidator: ValidatorsKeys | ControlValidator): boolean {
    const name = resolveValidatorName(nameOrValidator);
    return isNotNil(this._errors$.value[name]);
  }

  hasErrors(namesOrValidators: Array<ValidatorsKeys | ControlValidator>): boolean {
    const errors = this.getErrors();
    return (
      !!errors && namesOrValidators.some(nameOrValidator => isNotNil(errors[resolveValidatorName(nameOrValidator)]))
    );
  }

  getError<K extends ValidatorsKeys>(nameOrValidator: K | ControlValidator): ValidatorsModel[K] | undefined {
    const name = resolveValidatorName(nameOrValidator);
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

  selectHasError(nameOrValidator: ValidatorsKeys | ControlValidator): Observable<boolean> {
    const name = resolveValidatorName(nameOrValidator);
    return this.selectError(name).pipe(map(error => isNil(error)));
  }

  selectError<K extends ValidatorsKeys>(
    nameOrValidator: K | ControlValidator
  ): Observable<ValidatorsModel[K] | undefined> {
    const name = resolveValidatorName(nameOrValidator);
    return this.errors$.pipe(pluck(name), distinctUntilChanged());
  }

  updateError(callback: (state: Partial<ValidatorsModel>) => Partial<ValidatorsModel>): this {
    const newErrors = callback(this._errors$.value);
    this._invalid = !isObjectEmpty(newErrors);
    this._errors$.next(newErrors);
    return this._stateChanged();
  }

  removeError(nameOrValidator: ValidatorsKeys | ControlValidator): this {
    const name = resolveValidatorName(nameOrValidator);
    return this.updateError(state => Object.fromEntries(Object.entries(state).filter(([key]) => key !== name)));
  }

  addError<K extends ValidatorsKeys>(name: K, error: ValidatorsModel[K]): this {
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
