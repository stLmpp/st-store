import { ControlValidator } from './validator';
import { Control } from '../control';
import { isDate, isNil } from '@stlmpp/utils';
import { isAfter, isEqual } from 'date-fns';

export interface LesserValidationError<T extends Date | number> {
  expectedLesserThan: T;
  actual: T;
}

export class LesserValidator<T extends Date | number> implements ControlValidator<T, LesserValidationError<T>> {
  constructor(private lesser: T) {}

  name = 'lesser';

  validate(control: Control<T>): LesserValidationError<T> | null {
    const { value } = control;
    if (isNil(value)) {
      return null;
    }
    if (isDate(value)) {
      return isAfter(value, this.lesser) || isEqual(value, this.lesser)
        ? { actual: value, expectedLesserThan: this.lesser }
        : null;
    } else {
      return value >= this.lesser ? { expectedLesserThan: this.lesser, actual: value } : null;
    }
  }
}
