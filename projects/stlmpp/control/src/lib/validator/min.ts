import { ControlValidator, ControlValidatorAttributes } from './validator';
import { getTypeAndValue, MaxMinValidationError, MaxMinType } from './max';
import { isNil, isString } from '@stlmpp/utils';
import { isBefore, parseISO } from 'date-fns';
import { Control } from '../control/control';

export class MinValidator<T extends Date | number> implements ControlValidator<T, MaxMinValidationError<T>> {
  constructor(min: string | Date | number) {
    const [type, newMin, attr] = getTypeAndValue(min);
    this.type = type;
    this.min = newMin as any;
    this.attrs = { min: attr };
  }

  private readonly min: T;
  private readonly type: MaxMinType;

  attrs: ControlValidatorAttributes;

  name = 'max';

  validate({ value }: Control<T>): MaxMinValidationError<T> | null {
    if (isNil(value)) {
      return null;
    }
    switch (this.type) {
      case 'number': {
        return value < this.min ? { actual: value, required: this.min } : null;
      }
      case 'date': {
        const newValue = isString(value) ? parseISO(value) : (value as Date);
        return isBefore(newValue, this.min) ? ({ actual: newValue, required: this.min } as any) : null;
      }
    }
  }
}
