import { AbstractWhiteSpaceValidator } from './white-space';
import { Directive, Input } from '@angular/core';
import { ControlValidator } from '../validator';
import { BooleanInput, coerceBooleanProperty } from 'st-utils';
import { Control } from '../../control/control';
import { Observable } from 'rxjs';
import { Nullable } from '../../util';

@Directive({
  selector: '[model][whiteSpace]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: WhiteSpaceValidatorDirective, multi: true }],
})
export class WhiteSpaceValidatorDirective extends AbstractWhiteSpaceValidator {
  private _whiteSpace = false;

  @Input()
  get whiteSpace(): boolean {
    return this._whiteSpace;
  }
  set whiteSpace(whiteSpace: boolean) {
    this._whiteSpace = coerceBooleanProperty(whiteSpace);
  }

  validate(control: Control<Nullable<string>>): Observable<boolean | null> | boolean | null {
    if (!this._whiteSpace) {
      return null;
    }
    return super.validate(control);
  }

  static ngAcceptInputType_whiteSpace: BooleanInput;
}
