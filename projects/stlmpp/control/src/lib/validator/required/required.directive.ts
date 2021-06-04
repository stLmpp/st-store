import { AbstractRequiredValidator } from './required';
import { Directive, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BooleanInput, coerceBooleanProperty } from 'st-utils';
import { Control } from '../../control/control';
import { ControlValidator } from '../validator';

@Directive({
  selector: '[model][required]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: RequiredValidatorDirective, multi: true }],
})
export class RequiredValidatorDirective<T = any> extends AbstractRequiredValidator<T> implements OnChanges {
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

  ngOnChanges(changes: SimpleChanges): void {
    const requiredChange = changes.required;
    if (requiredChange && !requiredChange.isFirstChange()) {
      this.validationChange$.next();
    }
  }

  static ngAcceptInputType_required: BooleanInput;
}
