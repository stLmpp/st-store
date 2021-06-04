import { AbstractUrlValidator } from './url';
import { Directive, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BooleanInput, coerceBooleanProperty } from 'st-utils';
import { Control } from '../../control/control';
import { PatternValidationError } from './pattern';
import { ControlValidator } from '../validator';
import { Nullable } from '../../util';

@Directive({
  selector: '[model][url]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: UrlValidatorDirective, multi: true }],
})
export class UrlValidatorDirective extends AbstractUrlValidator implements OnChanges {
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

  validate(control: Control<Nullable<string>>): PatternValidationError | null {
    if (!this._url) {
      return null;
    }
    return super.validate(control);
  }

  ngOnChanges(changes: SimpleChanges): void {
    const urlChange = changes.url;
    if (urlChange && !urlChange.isFirstChange()) {
      this.validationChange$.next();
    }
    super.ngOnChanges(changes);
  }

  static ngAcceptInputType_url: BooleanInput;
}
