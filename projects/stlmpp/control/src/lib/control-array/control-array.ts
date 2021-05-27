import { ControlGroup } from '../control-group/control-group';
import { PartialDeep } from 'type-fest';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { ControlUpdateOn } from '../control-update-on';
import { AbstractControl, AbstractControlOptions } from '../abstract-control';
import { skip, takeUntil } from 'rxjs/operators';
import { Control, ControlUpdateOptions } from '../control/control';
import { ControlType } from '../control/control-type';
import { getUniqueId } from '../util';

export type ControlArrayOptions<M = any> = AbstractControlOptions<M>;

export class ControlArray<T = any, M = any, C extends Control | ControlGroup | ControlArray = ControlType<T>>
  implements Iterable<C>, AbstractControl<T[], M>
{
  constructor(private _controls: C[], private options?: ControlArrayOptions<M>) {
    this.metadata = options?.metadata;
    this._originControls = [..._controls];
    for (const control of _controls) {
      this._registerParent(control);
      if (options?.updateOn) {
        control.setUpdateOn(options.updateOn);
      }
      if (options?.disabled) {
        control.disable(options.disabled);
      }
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

  private _setValue$(): void {
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
  }

  private _registerParent(control: C): void {
    control.parent = this;
  }

  *[Symbol.iterator](): Iterator<C> {
    for (const control of this._controls) {
      yield control;
    }
  }

  /** @internal */
  setUpdateOn(updateOn?: ControlUpdateOn): void {
    if (updateOn) {
      for (const control of this._controls) {
        control.setUpdateOn(updateOn);
      }
    }
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

  push(control: C): void {
    this._controls.push(control);
    this._registerParent(control);
    if (this.options?.updateOn) {
      control.setUpdateOn(this.options.updateOn);
    }
    this._setValue$();
  }

  insert(index: number, control: C): void {
    this._controls.splice(index, 0, control);
    this._registerParent(control);
    if (this.options?.updateOn) {
      control.setUpdateOn(this.options.updateOn);
    }
    this._setValue$();
  }

  removeAt(index: number): void {
    this._controls.splice(index, 1);
    this._setValue$();
  }

  get length(): number {
    return this._controls.length;
  }

  setValue(values: T[], options?: ControlUpdateOptions): void {
    for (let index = 0, len = values.length; index < len; index++) {
      const control = this.get(index);
      if (control) {
        this._controls[index].setValue(values[index] as any, options);
      }
    }
  }

  patchValue(values: PartialDeep<T[]> | T[], options?: ControlUpdateOptions): void {
    for (let index = 0, len = values.length; index < len; index++) {
      const control = this.get(index);
      if (control) {
        const value = values[index];
        control.patchValue(value as any, options);
      }
    }
  }

  disable(disabled = true): void {
    for (const control of this._controls) {
      control.disable(disabled);
    }
  }

  enable(enabled = true): void {
    this.disable(!enabled);
  }

  reset(): void {
    this._controls = [...this._originControls];
    for (const control of this._controls) {
      control.reset();
    }
    this._setValue$();
  }

  clear(): void {
    this._controls = [];
    this._setValue$();
  }

  /** @internal */
  submit(): void {
    for (const control of this._controls) {
      control.submit();
    }
  }

  markAsDirty(dirty = true): void {
    for (const control of this._controls) {
      control.markAsDirty(dirty);
    }
  }

  markAsTouched(touched = true): void {
    for (const control of this._controls) {
      control.markAsTouched(touched);
    }
  }

  markAsInvalid(invalid = true): void {
    for (const control of this._controls) {
      control.markAsInvalid(invalid);
    }
  }

  /** @internal */
  destroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}

export function isControlArray(value: any): value is ControlArray {
  return value instanceof ControlArray;
}
