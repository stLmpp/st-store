import { ControlValidator } from '../validator';
import { Control } from '../../control/control';
import { isDate, isNil } from '@stlmpp/utils';
import { isBefore, isEqual } from 'date-fns';
import { Directive, Input } from '@angular/core';

export interface GreaterValidationError<T extends Date | number> {
  expectedGreaterThan: T;
  actual: T;
}

@Directive()
export abstract class AbstractGreaterValidator<T extends Date | number> extends ControlValidator<
  T,
  GreaterValidationError<T>
> {
  @Input() greater!: T;

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

export class GreaterValidator<T extends Date | number> extends AbstractGreaterValidator<T> {
  constructor(public greater: T) {
    super();
  }
}
