import { ControlValidator } from '../validator';
import { Control } from '../../control/control';
import { isDate, isNil } from '@stlmpp/utils';
import { isAfter, isEqual } from 'date-fns';
import { Directive, Input } from '@angular/core';
import { Nullable } from '../../util';

export interface LesserValidationError<T extends Nullable<Date | number>> {
  expectedLesserThan: NonNullable<T>;
  actual: T;
}

@Directive()
export abstract class AbstractLesserValidator<T extends Nullable<Date | number>> extends ControlValidator<
  T,
  LesserValidationError<T>
> {
  @Input() lesser!: NonNullable<T>;

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

export class LesserValidator<T extends Nullable<Date | number>> extends AbstractLesserValidator<T> {
  constructor(public lesser: NonNullable<T>) {
    super();
  }
}
