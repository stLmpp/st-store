import { ControlValidator } from '../validator';
import { Control } from '../../control/control';
import { isDate, isNil } from 'st-utils';
import { isAfter, isEqual } from 'date-fns';
import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';

export interface LesserValidationError<T extends Date | number | null | undefined> {
  expectedLesserThan: NonNullable<T>;
  actual: T;
}

@Directive()
export abstract class AbstractLesserValidator<T extends Date | number | null | undefined>
  extends ControlValidator<T, LesserValidationError<T>>
  implements OnChanges
{
  @Input() lesser!: NonNullable<T>;

  readonly name: string = 'lesser';

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

  ngOnChanges(changes: SimpleChanges): void {
    const lesserChange = changes.lesser;
    if (lesserChange && !lesserChange.isFirstChange()) {
      this.validationChange$.next();
    }
  }
}

export class LesserValidator<T extends Date | number | null | undefined> extends AbstractLesserValidator<T> {
  constructor(lesser: NonNullable<T>) {
    super();
    this.lesser = lesser;
  }
}
