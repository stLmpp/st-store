import { ControlGroup } from '../control-group/control-group';
import { PartialDeep } from 'type-fest';
import { BehaviorSubject, combineLatest, skip, Subject, takeUntil } from 'rxjs';
import { ControlUpdateOn } from '../control-update-on';
import { AbstractControl, AbstractControlOptions } from '../abstract-control';
import { Control, ControlUpdateOptions } from '../control/control';
import { ControlType } from '../control/control-type';
import { getUniqueId } from '../util';
import { isNotNil } from 'st-utils';

export type ControlArrayOptions<M = any> = AbstractControlOptions<M>;

export class ControlArray<T = any, M = any, C extends Control | ControlGroup | ControlArray = ControlType<T>>
  implements Iterable<C>, AbstractControl<T[], M>
{
  constructor(private _controls: C[], private options?: ControlArrayOptions<M>) {
    this.metadata = options?.metadata;
    this._originControls = [..._controls];
    for (const control of _controls) {
      this._registerControl(control);
    }
    this._setValue$();
  }

  private readonly _originControls: C[];

  private _parent: ControlGroup | ControlArray | undefined;
  private readonly _destroy$ = new Subject<void>();
  private readonly _value$ = new BehaviorSubject<T[]>([]);

  readonly value$ = this._value$.asObservable();
  readonly valueChanges$ = this.value$.pipe(skip(1));
  readonly uniqueId = getUniqueId();

  metadata?: M;

  get parent(): ControlGroup | ControlArray | undefined {
    return this._parent;
  }
  /** @internal */
  set parent(parent: ControlGroup | ControlArray | undefined) {
    this._parent = parent;
  }

  private _setValue$(): this {
    this._destroy$.next();
    if (this._controls.length) {
      combineLatest(this._controls.map(control => control.value$))
        .pipe(takeUntil(this._destroy$))
        .subscribe(values => {
          this._value$.next(values);
        });
    } else {
      this._value$.next([]);
    }
    return this;
  }

  private _registerControl(control: C): this {
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

  *[Symbol.iterator](): Iterator<C> {
    for (const control of this._controls) {
      yield control;
    }
  }

  /** @internal */
  setUpdateOn(updateOn?: ControlUpdateOn): this {
    if (updateOn) {
      for (const control of this._controls) {
        control.setUpdateOn(updateOn);
      }
    }
    return this;
  }

  get value(): T[] {
    return this._value$.value;
  }

  get invalid(): boolean {
    return this._controls.some(control => control.invalid);
  }

  get valid(): boolean {
    return !this.invalid;
  }

  get dirty(): boolean {
    return this._controls.some(control => control.dirty);
  }

  get pristine(): boolean {
    return !this.dirty;
  }

  get touched(): boolean {
    return this._controls.some(control => control.touched);
  }

  get untouched(): boolean {
    return !this.touched;
  }

  get pending(): boolean {
    return this._controls.some(control => control.pending);
  }

  get controls(): C[] {
    return this._controls;
  }

  get disabled(): boolean {
    return this._controls.every(control => control.disabled);
  }

  get enabled(): boolean {
    return !this.disabled;
  }

  get(index: number): C | undefined {
    return this._controls[index];
  }

  push(...controls: C[]): this {
    this._controls.push(...controls);
    for (const control of controls) {
      this._registerControl(control);
    }
    return this._setValue$();
  }

  insert(index: number, ...controls: C[]): this {
    this._controls.splice(index, 0, ...controls);
    for (const control of controls) {
      this._registerControl(control);
    }
    return this._setValue$();
  }

  removeAt(...indices: number[]): this {
    let setValue = false;
    for (const index of indices) {
      if (this.get(index)) {
        this._controls.splice(index, 1);
        setValue = true;
      }
    }
    if (setValue) {
      this._setValue$();
    }
    return this;
  }

  move(fromIndex: number, toIndex: number): this {
    fromIndex = Math.max(fromIndex, 0);
    toIndex = Math.min(toIndex, this.length - 1);
    if (fromIndex === toIndex) {
      return this;
    }
    const [control] = this._controls.splice(fromIndex, 1);
    this._controls.splice(toIndex, 0, control);
    return this._setValue$();
  }

  replace(index: number, control: C): this {
    if (this.get(index)) {
      this._controls[index] = control;
      this._setValue$();
    }
    return this;
  }

  get length(): number {
    return this._controls.length;
  }

  setValue(values: T[], options?: ControlUpdateOptions): this {
    for (let index = 0, len = values.length; index < len; index++) {
      const control = this.get(index);
      if (control) {
        control.setValue(values[index], options);
      }
    }
    return this;
  }

  patchValue(values: PartialDeep<T[]> | T[], options?: ControlUpdateOptions): this {
    for (let index = 0, len = values.length; index < len; index++) {
      const control = this.get(index);
      if (control) {
        const value = values[index];
        control.patchValue(value as any, options);
      }
    }
    return this;
  }

  disable(disabled = true): this {
    for (const control of this._controls) {
      control.disable(disabled);
    }
    return this;
  }

  enable(enabled = true): this {
    return this.disable(!enabled);
  }

  reset(): this {
    this._controls = [...this._originControls];
    for (const control of this._controls) {
      control.reset();
    }
    return this._setValue$();
  }

  clear(): this {
    this._controls = [];
    return this._setValue$();
  }

  /** @internal */
  submit(): this {
    for (const control of this._controls) {
      control.submit();
    }
    return this;
  }

  markAsDirty(dirty = true): this {
    for (const control of this._controls) {
      control.markAsDirty(dirty);
    }
    return this;
  }

  markAsTouched(touched = true): this {
    for (const control of this._controls) {
      control.markAsTouched(touched);
    }
    return this;
  }

  markAsInvalid(invalid = true): this {
    for (const control of this._controls) {
      control.markAsInvalid(invalid);
    }
    return this;
  }

  /** @internal */
  destroy(): this {
    this._destroy$.next();
    this._destroy$.complete();
    return this;
  }
}

export function isControlArray(value: any): value is ControlArray {
  return value instanceof ControlArray;
}
