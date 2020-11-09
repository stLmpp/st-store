import { ControlValidator } from './validator';
import { Control } from '../control/control';
import { isDate, isNil } from '@stlmpp/utils';
import { isBefore, isEqual } from 'date-fns';

export interface GreaterValidationError<T extends Date | number> {
  expectedGreaterThan: T;
  actual: T;
}

export class GreaterValidator<T extends Date | number> implements ControlValidator<T, GreaterValidationError<T>> {
  constructor(private greater: T) {}

  name = 'greater';

  validate({ value }: Control<T>): GreaterValidationError<T> | null {
    if (isNil(value)) {
      return null;
    }
    if (isDate(value)) {
      return isBefore(value, this.greater) || isEqual(value, this.greater)
        ? { actual: value, expectedGreaterThan: this.greater }
        : null;
    } else {
      return value <= this.greater ? { actual: value, expectedGreaterThan: this.greater } : null;
    }
  }
}
