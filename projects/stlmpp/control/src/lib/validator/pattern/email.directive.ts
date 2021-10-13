import { AbstractEmailValidator } from './email';
import { Directive, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BooleanInput, coerceBooleanProperty } from 'st-utils';
import { Control } from '../../control/control';
import { ControlValidator } from '../validator';

@Directive({
  selector: '[model][email]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: EmailValidatorDirective, multi: true }],
})
export class EmailValidatorDirective extends AbstractEmailValidator implements OnChanges {
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

  override validate(control: Control<string | null | undefined>): boolean | null {
    if (!this._email) {
      return null;
    }
    return super.validate(control);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const emailChange = changes.email;
    if (emailChange && !emailChange.isFirstChange()) {
      this.validationChange$.next();
    }
  }

  static ngAcceptInputType_email: BooleanInput;
}
