import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { isNil } from '@stlmpp/utils';
import { PartialDeep } from 'type-fest';
import { ControlUpdateOn } from '../control-update-on';
import { AbstractControl, AbstractControlOptions } from '../abstract-control';
import { Control, ControlUpdateOptions } from '../control/control';
import { ControlType } from '../control/control-type';
import { ControlArray } from '../control-array/control-array';

export type ControlGroupType<T> = {
  [K in keyof T]: ControlType<T[K]>;
};

export type ControlGroupValueType<T> = {
  [K in keyof T]: T[K] extends Control<infer U> ? U : T[K];
};

export type ControlGroupOptions = AbstractControlOptions;

export class ControlGroup<T = any, RealT = ControlGroupValueType<T>> implements AbstractControl<RealT> {
  constructor(public controls: ControlGroupType<T>, options?: ControlGroupOptions) {
    const values$ = this.values().map(value => value.value$);
    const keys = this.keys();
    this.value$ = combineLatest(values$).pipe(
      map(values => {
        return values.reduce((acc, item, index) => {
          return { ...acc, [keys[index]]: item };
        }, {});
      })
    );
    for (const control of this.values()) {
      control.parent = this;
      if (options?.updateOn) {
        control.setUpdateOn(options.updateOn);
      }
      if (options?.disabled) {
        control.disable(options.disabled);
      }
    }
  }

  value$!: Observable<RealT>;

  /** @internal */
  submitted = false;

  private _parent: ControlGroup | ControlArray | null | undefined;

  get parent(): ControlGroup | ControlArray | null | undefined {
    return this._parent;
  }
  /** @internal */
  set parent(parent: ControlGroup | ControlArray | null | undefined) {
    this._parent = parent;
  }

  /** @internal */
  setUpdateOn(updateOn?: ControlUpdateOn): void {
    if (updateOn) {
      for (const control of this.values()) {
        control.setUpdateOn(updateOn);
      }
    }
  }

  private entries(): [keyof T, Control | ControlGroup | ControlArray][] {
    return Object.entries(this.controls) as [keyof T, Control | ControlGroup | ControlArray][];
  }

  private values(): (Control | ControlGroup | ControlArray)[] {
    return Object.values(this.controls);
  }

  private keys(): (keyof T)[] {
    return Object.keys(this.controls) as (keyof T)[];
  }

  get value(): RealT {
    return this.entries().reduce((acc, [key, value]) => {
      return { ...acc, [key]: value.value };
    }, {}) as any;
  }

  get invalid(): boolean {
    return this.values().some(value => value.invalid);
  }

  get valid(): boolean {
    return !this.invalid;
  }

  get dirty(): boolean {
    return this.values().some(value => value.dirty);
  }

  get touched(): boolean {
    return this.values().some(value => value.touched);
  }

  get untouched(): boolean {
    return !this.touched;
  }

  get pristine(): boolean {
    return !this.dirty;
  }

  get pending(): boolean {
    return this.values().some(value => value.pending);
  }

  get disabled(): boolean {
    return this.values().every(value => value.disabled);
  }

  get enabled(): boolean {
    return !this.disabled;
  }

  disable(disabled = true): void {
    for (const control of this.values()) {
      control.disable(disabled);
    }
  }

  enable(enable = true): void {
    this.disable(!enable);
  }

  setValue(value: RealT | undefined | null, options?: ControlUpdateOptions): void {
    for (const [key, control] of this.entries()) {
      control.setValue((value as any)?.[key], options);
    }
  }

  patchValue(value: PartialDeep<RealT> | RealT, options?: ControlUpdateOptions): void {
    for (const [key, control] of this.entries()) {
      const valueKey = (value as any)[key];
      if (!isNil(valueKey)) {
        control.patchValue(valueKey, options);
      }
    }
  }

  get<K extends keyof T>(key: K): ControlGroupType<T>[K] {
    return this.controls[key];
  }

  reset(): void {
    for (const control of this.values()) {
      control.reset();
    }
    this.submitted = false;
  }

  submit(): void {
    for (const control of this.values()) {
      control.submit();
    }
    this.submitted = true;
  }

  markAsDirty(dirty = true): void {
    for (const control of this.values()) {
      control.markAsDirty(dirty);
    }
  }

  markAsTouched(touched = true): void {
    for (const control of this.values()) {
      control.markAsTouched(touched);
    }
  }

  markAsInvalid(invalid = true): void {
    for (const control of this.values()) {
      control.markAsInvalid(invalid);
    }
  }
}
