import { Observable } from 'rxjs';
import { PartialDeep } from 'type-fest';
import { ControlUpdateOn } from './control-update-on';
import { Directive, Input } from '@angular/core';

export interface AbstractControl<T = any, M = any> {
  value$: Observable<T>;
  valueChanges$: Observable<T>;
  value: T;
  parent: AbstractControl | undefined;
  pristine: boolean;
  dirty: boolean;
  touched: boolean;
  untouched: boolean;
  invalid: boolean;
  valid: boolean;
  pending: boolean;
  disabled: boolean;
  enabled: boolean;
  uniqueId: number;
  metadata?: M;
  /** @internal */
  setUpdateOn(updateOn: ControlUpdateOn): this;
  markAsDirty(dirty?: boolean): this;
  markAsTouched(touched?: boolean): this;
  markAsInvalid(invalid?: boolean): void;
  setValue(value: T): this;
  patchValue(value: PartialDeep<T> | T): this;
  disable(disabled?: boolean): this;
  enable(enabled?: boolean): this;
  reset(): this;
  /** @internal */
  submit(): this;
}

@Directive()
export abstract class AbstractControlDirective<T = any> {
  protected _disabled: boolean | undefined;
  protected control!: AbstractControl<T>;

  @Input()
  set disabled(disabled: boolean) {
    this._disabled = disabled;
    this.control?.disable(disabled);
  }

  get isInvalid(): boolean {
    return this.control?.invalid;
  }

  get isValid(): boolean {
    return this.control?.valid;
  }

  get isPristine(): boolean {
    return this.control?.pristine;
  }

  get isDirty(): boolean {
    return this.control?.dirty;
  }

  get isTouched(): boolean {
    return this.control?.touched;
  }

  get isUntouched(): boolean {
    return this.control?.untouched;
  }

  get isPending(): boolean {
    return this.control?.pending;
  }

  get isDisabled(): boolean {
    return this.control?.disabled;
  }
}

export interface AbstractControlOptions<M = any> {
  updateOn?: ControlUpdateOn;
  disabled?: boolean;
  metadata?: M;
}
