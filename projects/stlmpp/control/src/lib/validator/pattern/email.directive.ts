import { AbstractEmailValidator } from './email';
import { Directive, HostBinding, Input } from '@angular/core';
import { BooleanInput, coerceBooleanProperty } from 'st-utils';
import { Control } from '../../control/control';
import { ControlValidator } from '../validator';
import { Nullable } from '../../util';

@Directive({
  selector: '[model][email]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: EmailValidatorDirective, multi: true }],
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

  validate(control: Control<Nullable<string>>): boolean | null {
    if (!this._email) {
      return null;
    }
    return super.validate(control);
  }

  static ngAcceptInputType_email: BooleanInput;
}
