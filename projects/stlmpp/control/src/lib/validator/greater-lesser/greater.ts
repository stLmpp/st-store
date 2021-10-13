import { ControlValidator } from '../validator';
import { Control } from '../../control/control';
import { isDate, isNil } from 'st-utils';
import { isBefore, isEqual } from 'date-fns';
import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';

export interface GreaterValidationError<T extends Date | number | null | undefined> {
  expectedGreaterThan: NonNullable<T>;
  actual: T;
}

@Directive()
export abstract class AbstractGreaterValidator<T extends Date | number | null | undefined>
  extends ControlValidator<T, GreaterValidationError<T>>
  implements OnChanges
{
  @Input() greater!: NonNullable<T>;

  readonly name: string = 'greater';

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

export class GreaterValidator<T extends Date | number | null | undefined> extends AbstractGreaterValidator<T> {
  constructor(greater: NonNullable<T>) {
    super();
    this.greater = greater;
  }
}
