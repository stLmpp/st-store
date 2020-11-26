import { AbstractRequiredValidator } from './required';
import { Directive, forwardRef, HostBinding, Input } from '@angular/core';
import { BooleanInput, coerceBooleanProperty } from '@stlmpp/utils';
import { Control } from '../../control/control';
import { ControlValidator } from '../validator';

@Directive({
  selector: '[model][required]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: forwardRef(() => RequiredValidatorDirective), multi: true }],
})
export class RequiredValidatorDirective<T = any> extends AbstractRequiredValidator<T> {
  private _required = false;

  @HostBinding('attr.required')
  get attrRequired(): string | null {
    return this._required ? '' : null;
  }

  @Input()
  @HostBinding('attr.aria-required')
  get required(): boolean {
    return this._required;
  }
  set required(required: boolean) {
    this._required = coerceBooleanProperty(required);
    if (this._required) {
      this.attrs = { required: undefined, 'aria-required': true };
    } else {
      this.attrs = {};
    }
  }

  validate(control: Control<T>): boolean | null {
    if (!this._required) {
      return null;
    }
    return super.validate(control);
  }

  static ngAcceptInputType_required: BooleanInput;
}
