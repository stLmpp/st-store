import { Control } from '../../control/control';
import { ControlValidator, ControlValidatorAttributes } from '../validator';
import { Directive, HostBinding, Input } from '@angular/core';

export interface LengthValidationError {
  required: number;
  actual: number;
}

@Directive()
export abstract class AbstractMaxLengthValidator<T extends string | any[] = any> extends ControlValidator<
  T,
  LengthValidationError
> {
  @HostBinding('attr.maxlength')
  get maxlengthAttr(): number {
    return this._maxLength;
  }

  @Input()
  set maxLength(maxLength: number) {
    this._maxLength = maxLength;
    this.attrs = { maxLength };
  }
  private _maxLength!: number;

  name = 'maxLength';

  attrs: ControlValidatorAttributes = {};

  validate({ value }: Control<T>): LengthValidationError | null {
    if (!value) {
      return null;
    }
    const length = value.length;
    return length > this._maxLength ? { actual: length, required: this._maxLength } : null;
  }
}

export class MaxLengthValidator<T extends string | any[] = any> extends AbstractMaxLengthValidator<T> {
  constructor(maxLength: number) {
    super();
    this.maxLength = maxLength;
  }
}
