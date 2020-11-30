import { ControlValidator, ControlValidatorAttributes } from '../validator';
import { getTypeAndValue, MaxMinValidationError, MaxMinType } from './max';
import { isNil, isString } from '@stlmpp/utils';
import { isBefore, parseISO } from 'date-fns';
import { Control } from '../../control/control';
import { Directive, HostBinding, Input } from '@angular/core';
import { Nullable } from '../../util';

@Directive()
export abstract class AbstractMinValidator<T extends Nullable<Date | number>> extends ControlValidator<
  T,
  MaxMinValidationError<T>
> {
  @HostBinding('attr.min')
  get minAttr(): string {
    return '' + this.attrs.min;
  }

  @Input()
  set min(min: NonNullable<T> | string) {
    const [type, newMin, attr] = getTypeAndValue(min);
    this._type = type;
    this._min = newMin as any;
    this.attrs = { min: attr };
  }
  private _min!: NonNullable<T>;
  private _type!: MaxMinType;

  attrs: ControlValidatorAttributes = {};

  name = 'min';

  validate({ value }: Control<T>): MaxMinValidationError<T> | null {
    if (isNil(value)) {
      return null;
    }
    switch (this._type) {
      case 'number': {
        return value < this._min ? { actual: value, required: this._min } : null;
      }
      case 'date': {
        const newValue = isString(value) ? parseISO(value) : (value as Date);
        return isBefore(newValue, this._min) ? ({ actual: newValue, required: this._min } as any) : null;
      }
    }
  }
}

export class MinValidator<T extends Nullable<Date | number>> extends AbstractMinValidator<T> {
  constructor(min: NonNullable<T> | string) {
    super();
    this.min = min;
  }
}
