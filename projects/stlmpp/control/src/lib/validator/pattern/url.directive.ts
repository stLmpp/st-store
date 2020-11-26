import { AbstractUrlValidator } from './url';
import { Directive, forwardRef, HostBinding, Input } from '@angular/core';
import { BooleanInput, coerceBooleanProperty } from '@stlmpp/utils';
import { Control } from '../../control/control';
import { PatternValidationError } from './pattern';
import { ControlValidator } from '../validator';

@Directive({
  selector: '[model][url]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: forwardRef(() => UrlValidatorDirective), multi: true }],
})
export class UrlValidatorDirective extends AbstractUrlValidator {
  private _url = true;

  @HostBinding('attr.pattern')
  get attrUrl(): string | null {
    return this._url ? this.regExp.source : null;
  }

  @Input()
  set url(url: boolean) {
    this._url = coerceBooleanProperty(url);
    if (this._url) {
      this.attrs = { pattern: this.regExp.source };
    } else {
      this.attrs = {};
    }
  }

  validate(control: Control<string>): PatternValidationError | null {
    if (!this._url) {
      return null;
    }
    return super.validate(control);
  }

  static ngAcceptInputType_url: BooleanInput;
}
