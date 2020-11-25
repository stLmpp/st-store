import { AbstractEmailValidator } from './email';
import { Directive, forwardRef, HostBinding, Input } from '@angular/core';
import { BooleanInput, coerceBooleanProperty } from '@stlmpp/utils';
import { Control } from '../../control/control';
import { ControlValidator } from '../validator';

@Directive({
  selector: '[model][email]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: forwardRef(() => EmailValidatorDirective), multi: true }],
})
export class EmailValidatorDirective extends AbstractEmailValidator {
  private _email = true;

  @HostBinding('attr.email')
  get emailAttr(): string | null {
    return this._email ? '' : null;
  }

  @Input()
  set email(email: boolean) {
    this._email = coerceBooleanProperty(email);
    if (this._email) {
      this.attrs = { email: undefined };
    } else {
      this.attrs = {};
    }
  }

  validate(control: Control<string>): boolean | null {
    if (!this._email) {
      return null;
    }
    return super.validate(control);
  }

  static ngAcceptInputType_email: BooleanInput;
}
