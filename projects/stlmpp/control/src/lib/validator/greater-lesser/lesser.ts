import { ControlValidator } from '../validator';
import { Control } from '../../control/control';
import { isDate, isNil } from '@stlmpp/utils';
import { isAfter, isEqual } from 'date-fns';
import { Directive, Input } from '@angular/core';

export interface LesserValidationError<T extends Date | number> {
  expectedLesserThan: T;
  actual: T;
}

@Directive()
export abstract class AbstractLesserValidator<T extends Date | number> extends ControlValidator<
  T,
  LesserValidationError<T>
> {
  @Input() lesser!: T;

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

export class LesserValidator<T extends Date | number> extends AbstractLesserValidator<T> {
  constructor(public lesser: T) {
    super();
  }
}
