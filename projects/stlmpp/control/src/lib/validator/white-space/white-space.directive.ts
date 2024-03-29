import { AbstractWhiteSpaceValidator } from './white-space';
import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValidator } from '../validator';
import { BooleanInput, coerceBooleanProperty } from 'st-utils';
import { Control } from '../../control/control';
import { Observable } from 'rxjs';
import { Nullable } from '../../util';

@Directive({
  selector: '[model][whiteSpace]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: WhiteSpaceValidatorDirective, multi: true }],
})
export class WhiteSpaceValidatorDirective extends AbstractWhiteSpaceValidator implements OnChanges {
  private _whiteSpace = false;

  @Input()
  get whiteSpace(): boolean {
    return this._whiteSpace;
  }
  set whiteSpace(whiteSpace: BooleanInput) {
    this._whiteSpace = coerceBooleanProperty(whiteSpace);
  }

  override validate(control: Control<Nullable<string>>): Observable<boolean | null> | boolean | null {
    if (!this._whiteSpace) {
      return null;
    }
    return super.validate(control);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const whiteSpaceChange = changes.whiteSpace;
    if (whiteSpaceChange && !whiteSpaceChange.isFirstChange()) {
      this.validationChange$.next();
    }
  }
}
