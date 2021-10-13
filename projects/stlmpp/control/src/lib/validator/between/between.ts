import { ControlValidator } from '../validator';
import { Control } from '../../control/control';
import { isDate, isNil } from 'st-utils';
import { isAfter, isBefore, isEqual } from 'date-fns';
import { Directive, Input } from '@angular/core';

export interface BetweenError<T extends Date | number | null | undefined> {
  expectedStart: NonNullable<T>;
  expectedEnd: NonNullable<T>;
  actual: T;
}

@Directive()
export abstract class AbstractBetweenValidator<T extends Date | number | null | undefined> extends ControlValidator<
  T,
  BetweenError<T>
> {
  @Input('betweenInclusiveness') inclusiveness: [includeStart: boolean, includeEnd: boolean] = [true, true];

  abstract start: NonNullable<T>;
  abstract end: NonNullable<T>;

  readonly name: string = 'between';

  validate({ value }: Control<T>): BetweenError<T> | null {
    if (isNil(value)) {
      return null;
    }
    const [includeStart, includeEnd] = this.inclusiveness;
    if (isDate(value)) {
      const before = includeStart
        ? isBefore(value, this.start)
        : isBefore(value, this.start) || isEqual(value, this.start);
      const after = includeEnd ? isAfter(value, this.end) : isAfter(value, this.start) || isEqual(value, this.end);
      return before || after ? { actual: value, expectedEnd: this.end, expectedStart: this.start } : null;
    } else {
      const before = includeStart ? value < this.start : value <= this.start;
      const after = includeEnd ? value > this.end : value >= this.end;
      return before || after ? { actual: value, expectedEnd: this.end, expectedStart: this.start } : null;
    }
  }
}

export class BetweenValidator<T extends Date | number | null | undefined> extends AbstractBetweenValidator<T> {
  constructor(
    public start: NonNullable<T>,
    public end: NonNullable<T>,
    inclusiveness: [includeStart: boolean, includeEnd: boolean] = [true, true]
  ) {
    super();
    this.inclusiveness = inclusiveness;
  }
}
