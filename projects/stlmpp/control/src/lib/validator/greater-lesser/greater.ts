import { ControlValidator } from '../validator';
import { Control } from '../../control/control';
import { isDate, isNil } from 'st-utils';
import { isBefore, isEqual } from 'date-fns';
import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Nullable } from '../../util';

export interface GreaterValidationError<T extends Nullable<Date | number>> {
  expectedGreaterThan: NonNullable<T>;
  actual: T;
}

@Directive()
export abstract class AbstractGreaterValidator<T extends Nullable<Date | number>>
  extends ControlValidator<T, GreaterValidationError<T>>
  implements OnChanges
{
  @Input() greater!: NonNullable<T>;

  readonly name = 'greater';

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

  ngOnChanges(changes: SimpleChanges): void {
    const greaterChange = changes.greater;
    if (greaterChange && !greaterChange.isFirstChange()) {
      this.validationChange$.next();
    }
  }
}

export class GreaterValidator<T extends Nullable<Date | number>> extends AbstractGreaterValidator<T> {
  constructor(public greater: NonNullable<T>) {
    super();
  }
}
