import { ControlValidator, ControlValidatorAttributes } from './validator';
import { Control } from '../control';
import { isDate, isNil, isString } from '@stlmpp/utils';
import { format, isAfter, parseISO } from 'date-fns';

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

export class MaxValidator<T extends Date | number> implements ControlValidator<T, MaxMinValidationError<T>> {
  constructor(max: string | T) {
    const [type, newMax, attr] = getTypeAndValue(max);
    this.type = type;
    this.max = newMax as any;
    this.attrs = { max: attr };
  }

  private readonly max: T;
  private readonly type: MaxMinType;

  attrs: ControlValidatorAttributes;

  name = 'max';

  validate({ value }: Control<T>): MaxMinValidationError<T> | null {
    if (isNil(value)) {
      return null;
    }
    switch (this.type) {
      case 'number': {
        return value > this.max ? { actual: value, required: this.max } : null;
      }
      case 'date': {
        const newValue = isString(value) ? parseISO(value) : (value as Date);
        return isAfter(newValue, this.max) ? ({ actual: newValue, required: this.max } as any) : null;
      }
    }
  }
}
