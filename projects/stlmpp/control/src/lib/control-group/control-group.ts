import { combineLatest, Observable } from 'rxjs';
import { map, skip } from 'rxjs/operators';
import { isNotNil } from 'st-utils';
import { PartialDeep } from 'type-fest';
import { ControlUpdateOn } from '../control-update-on';
import { AbstractControl, AbstractControlOptions } from '../abstract-control';
import { Control, ControlUpdateOptions, isControl } from '../control/control';
import { ControlType } from '../control/control-type';
import { ControlArray } from '../control-array/control-array';
import { getUniqueId } from '../util';

export type ControlGroupType<T extends Record<any, any>> = {
  [K in keyof T]: ControlType<T[K]>;
};

export type ControlGroupValueType<T extends Record<any, any>> = {
  [K in keyof T]: [T[K]] extends [Control<infer U>] ? U : T[K];
};

export type ControlGroupOptions<M = any> = AbstractControlOptions<M>;

export class ControlGroup<
  T extends Record<any, any> = Record<any, any>,
  M = any,
  RealT extends ControlGroupValueType<T> = ControlGroupValueType<T>
> implements AbstractControl<RealT, M>
{
  constructor(public controls: ControlGroupType<T>, private options?: ControlGroupOptions<M>) {
    this.metadata = options?.metadata;
    const values$ = this._values().map(value => value.value$);
    const keys = this._keys();
    this.value$ = combineLatest(values$).pipe(
      map(values => values.reduce((acc, item, index) => ({ ...acc, [keys[index]]: item }), {}))
    );
    this.valueChanges$ = this.value$.pipe(skip(1));
    for (const control of this._values()) {
      this._registerControl(control);
    }
  }

  private _parent: ControlGroup | ControlArray | undefined;

  readonly value$: Observable<RealT>;
  readonly valueChanges$: Observable<RealT>;
  readonly uniqueId = getUniqueId();

  /** @internal */
  submitted = false;

  metadata?: M;

  get parent(): ControlGroup | ControlArray | undefined {
    return this._parent;
  }
  /** @internal */
  set parent(parent: ControlGroup | ControlArray | undefined) {
    this._parent = parent;
  }

  private _entries(): [keyof T, Control | ControlGroup | ControlArray][] {
    return Object.entries(this.controls) as [keyof T, Control | ControlGroup | ControlArray][];
  }

  private _values(): (Control | ControlGroup | ControlArray)[] {
    return Object.values(this.controls);
  }

  private _keys(): (keyof T)[] {
    return Object.keys(this.controls) as (keyof T)[];
  }

  private _registerControl(control: Control | ControlGroup | ControlArray): this {
    control.parent = this;
    if (this.options?.updateOn) {
      control.setUpdateOn(this.options.updateOn);
    }
    const optionsDisabled = this.options?.disabled;
    if (isNotNil(optionsDisabled)) {
      control.disable(optionsDisabled);
    }
    return this;
  }

  /** @internal */
  setUpdateOn(updateOn?: ControlUpdateOn): this {
    if (updateOn) {
      for (const control of this._values()) {
        control.setUpdateOn(updateOn);
      }
    }
    return this;
  }

  get value(): RealT {
    return this._entries().reduce((acc, [key, value]) => ({ ...acc, [key]: value.value }), {} as RealT);
  }

  get invalid(): boolean {
    return this._values().some(value => value.invalid);
  }

  get valid(): boolean {
    return !this.invalid;
  }

  get dirty(): boolean {
    return this._values().some(value => value.dirty);
  }

  get touched(): boolean {
    return this._values().some(value => value.touched);
  }

  get untouched(): boolean {
    return !this.touched;
  }

  get pristine(): boolean {
    return !this.dirty;
  }

  get pending(): boolean {
    return this._values().some(value => value.pending);
  }

  get disabled(): boolean {
    return this._values().every(value => value.disabled);
  }

  get enabled(): boolean {
    return !this.disabled;
  }

  disable(disabled = true): this {
    for (const control of this._values()) {
      control.disable(disabled);
    }
    return this;
  }

  enable(enable = true): this {
    return this.disable(!enable);
  }

  setValue(value: RealT, options?: ControlUpdateOptions): this {
    for (const [key, control] of this._entries()) {
      control.setValue((value as any)?.[key], options);
    }
    return this;
  }

  patchValue(value: PartialDeep<RealT> | RealT, options?: ControlUpdateOptions): this {
    for (const [key, control] of this._entries()) {
      const valueKey = (value as any)[key];
      if ((isControl(control) && key in (value as object)) || isNotNil(valueKey)) {
        control.patchValue(valueKey, options);
      }
    }
    return this;
  }

  get<K extends keyof T>(key: K): ControlGroupType<T>[K] {
    return this.controls[key];
  }

  reset(): this {
    for (const control of this._values()) {
      control.reset();
    }
    this.submitted = false;
    return this;
  }

  submit(): this {
    for (const control of this._values()) {
      control.submit();
    }
    this.submitted = true;
    return this;
  }

  markAsDirty(dirty = true): this {
    for (const control of this._values()) {
      control.markAsDirty(dirty);
    }
    return this;
  }

  markAsTouched(touched = true): this {
    for (const control of this._values()) {
      control.markAsTouched(touched);
    }
    return this;
  }

  markAsInvalid(invalid = true): this {
    for (const control of this._values()) {
      control.markAsInvalid(invalid);
    }
    return this;
  }
}

export function isControlGroup(value: any): value is ControlGroup {
  return value instanceof ControlGroup;
}
