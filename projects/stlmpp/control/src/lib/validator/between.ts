import { ControlValidator } from './validator';
import { Control } from '../control/control';
import { isDate, isNil } from '@stlmpp/utils';
import { isAfter, isBefore, isEqual } from 'date-fns';

export interface BetweenError<T extends Date | number> {
  expectedStart: T;
  expectedEnd: T;
  actual: T;
}

export class BetweenValidator<T extends Date | number> implements ControlValidator<T, BetweenError<T>> {
  constructor(
    private start: T,
    private end: T,
    private inclusiveness: [includeStart: boolean, includeEnd: boolean] = [true, true]
  ) {}

  name = 'between';

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
