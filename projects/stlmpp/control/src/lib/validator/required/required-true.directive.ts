import { AbstractRequiredTrueValidator } from './required-true';
import { Directive, forwardRef, HostBinding, Input } from '@angular/core';
import { BooleanInput, coerceBooleanProperty } from '@stlmpp/utils';
import { Control } from '../../control/control';
import { ControlValidator } from '../validator';

@Directive({
  selector: '[model][requiredTrue]:not([control]):not([controlName])',
  providers: [
    { provide: ControlValidator, useExisting: forwardRef(() => RequiredTrueValidatorDirective), multi: true },
  ],
})
export class RequiredTrueValidatorDirective extends AbstractRequiredTrueValidator {
  private _requiredTrue = false;

  @HostBinding('attr.required')
  get requiredAttr(): string | null {
    return this._requiredTrue ? '' : null;
  }

  @Input()
  @HostBinding('attr.aria-required')
  get requiredTrue(): boolean {
    return this._requiredTrue;
  }
  set requiredTrue(requiredTrue: boolean) {
    this._requiredTrue = coerceBooleanProperty(requiredTrue);
    if (this._requiredTrue) {
      this.attrs = { required: undefined, 'aria-required': true };
    } else {
      this.attrs = {};
    }
  }

  validate(control: Control<boolean>): boolean | null {
    if (!this._requiredTrue) {
      return null;
    }
    return super.validate(control);
  }

  static ngAcceptInputType_requiredTrue: BooleanInput;
}
