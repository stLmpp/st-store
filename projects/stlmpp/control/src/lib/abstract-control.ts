import { Observable } from 'rxjs';
import { PartialDeep } from 'type-fest';
import { ControlUpdateOn } from './control-update-on';
import { Directive, HostBinding, Input } from '@angular/core';

export interface AbstractControl<T = any> {
  value$: Observable<T | null | undefined>;
  value: T | null | undefined;
  parent: AbstractControl | null | undefined;
  pristine: boolean;
  dirty: boolean;
  touched: boolean;
  untouched: boolean;
  invalid: boolean;
  valid: boolean;
  pending: boolean;
  disabled: boolean;
  enabled: boolean;
  /** @internal */
  setUpdateOn(updateOn: ControlUpdateOn): void;
  markAsDirty(dirty?: boolean): void;
  markAsTouched(touched?: boolean): void;
  markAsInvalid(invalid?: boolean): void;
  setValue(value: T | null | undefined): void;
  patchValue(value: PartialDeep<T> | T | null | undefined): void;
  disable(disabled?: boolean): void;
  enable(enabled?: boolean): void;
  reset(): void;
  /** @internal */
  submit(): void;
}

@Directive()
export abstract class AbstractControlDirective<T = any> {
  protected control!: AbstractControl<T>;

  @Input()
  set disabled(disabled: boolean) {
    this._disabled = disabled;
    this.control?.disable(disabled);
  }
  protected _disabled: boolean | undefined;

  @HostBinding('class.is-invalid')
  @HostBinding('attr.aria-invalid')
  get isInvalid(): boolean {
    return this.control?.invalid;
  }

  @HostBinding('class.is-valid')
  get isValid(): boolean {
    return this.control?.valid;
  }

  @HostBinding('class.is-pristine')
  get isPristine(): boolean {
    return this.control?.pristine;
  }

  @HostBinding('class.is-dirty')
  get isDirty(): boolean {
    return this.control?.dirty;
  }

  @HostBinding('class.is-touched')
  get isTouched(): boolean {
    return this.control?.touched;
  }

  @HostBinding('class.is-untouched')
  get isUntouched(): boolean {
    return this.control?.untouched;
  }

  @HostBinding('class.is-pending')
  get isPending(): boolean {
    return this.control?.pending;
  }

  @HostBinding('class.is-disabled')
  @HostBinding('attr.aria-disabled')
  get isDisabled(): boolean {
    return this.control?.disabled;
  }
}

export interface AbstractControlOptions {
  updateOn?: ControlUpdateOn;
  disabled?: boolean;
}
