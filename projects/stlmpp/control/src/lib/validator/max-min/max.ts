import { ControlValidator, ControlValidatorAttributes } from '../validator';
import { Control } from '../../control/control';
import { isDate, isNil, isString } from '@stlmpp/utils';
import { format, isAfter, parseISO } from 'date-fns';
import { Directive, HostBinding, Input } from '@angular/core';

export type MaxMinType = 'date' | 'number';

export interface MaxMinValidationError<T extends Date | number> {
  actual: T;
  required: T;
}

export function getTypeAndValue(maxMin: string | Date | number): [MaxMinType, Date | number, string] {
  if (isString(maxMin)) {
    return ['date', parseISO(maxMin), maxMin];
  } else {
    const isDateMaxMin = isDate(maxMin);
    return [isDateMaxMin ? 'date' : 'number', maxMin, isDateMaxMin ? format(maxMin, 'yyyy-MM-dd') : '' + maxMin];
  }
}

@Directive()
export abstract class AbstractMaxValidator<T extends Date | number> extends ControlValidator<
  T,
  MaxMinValidationError<T>
> {
  @HostBinding('attr.max')
  get maxAttr(): string {
    return '' + this.attrs.max;
  }

  @Input()
  set max(max: T | string) {
    const [type, newMax, attr] = getTypeAndValue(max);
    this.type = type;
    this._max = newMax as any;
    this.attrs = { max: attr };
  }
  private _max!: T;
  private type!: MaxMinType;

  attrs: ControlValidatorAttributes = {};

  name = 'max';

  validate({ value }: Control<T>): MaxMinValidationError<T> | null {
    if (isNil(value)) {
      return null;
    }
    switch (this.type) {
      case 'number': {
        return value > this._max ? { actual: value, required: this._max } : null;
      }
      case 'date': {
        const newValue = isString(value) ? parseISO(value) : (value as Date);
        return isAfter(newValue, this._max) ? ({ actual: newValue, required: this._max } as any) : null;
      }
    }
  }
}

export class MaxValidator<T extends Date | number> extends AbstractMaxValidator<T> {
  constructor(max: string | T) {
    super();
    this.max = max;
  }
}
