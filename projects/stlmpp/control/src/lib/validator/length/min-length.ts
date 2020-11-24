import { Control } from '../../control/control';
import { ControlValidator, ControlValidatorAttributes } from '../validator';
import { LengthValidationError } from './max-length';
import { Directive, HostBinding, Input } from '@angular/core';

@Directive()
export abstract class AbstractMinLengthValidator<T extends string | any[] = any> extends ControlValidator<
  T,
  LengthValidationError
> {
  @HostBinding('attr.minlength')
  get minlengthAttr(): number {
    return this._minLength;
  }

  @Input()
  set minLength(minLength: number) {
    this._minLength = minLength;
    this.attrs = { minLength };
  }
  get minLength(): number {
    return this._minLength;
  }
  private _minLength!: number;

  name = 'minLength';

  attrs: ControlValidatorAttributes = {};

  validate({ value }: Control<T>): LengthValidationError | null {
    if (!value) {
      return null;
    }
    const length = value.length;
    return length < this._minLength ? { actual: length, required: this._minLength } : null;
  }
}

export class MinLengthValidator<T extends string | any[] = any> extends AbstractMinLengthValidator<T> {
  constructor(minLength: number) {
    super();
    this.minLength = minLength;
  }
}
