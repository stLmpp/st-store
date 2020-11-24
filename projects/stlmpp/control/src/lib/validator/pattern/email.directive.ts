import { AbstractEmailValidator } from './email';
import { Directive, HostBinding, Input } from '@angular/core';
import { BooleanInput, coerceBooleanProperty } from '@stlmpp/utils';
import { Control } from '../../control/control';

@Directive({ selector: '[model][email]:not([control]):not([controlName])' })
export class EmailValidatorDirective extends AbstractEmailValidator {
  static ngAcceptBooleanInput: BooleanInput;

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
  private _email = true;

  validate(control: Control<string>): boolean | null {
    if (!this._email) {
      return null;
    }
    return super.validate(control);
  }
}
