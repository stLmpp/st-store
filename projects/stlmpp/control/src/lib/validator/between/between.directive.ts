import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { ControlValidator } from '../validator';
import { AbstractBetweenValidator } from './between';
import { isArray, isObject } from 'st-utils';

@Directive({
  selector: `[model][between]:not([control]):not([controlName])`,
  providers: [{ provide: ControlValidator, useExisting: BetweenValidatorDirective, multi: true }],
})
export class BetweenValidatorDirective<T extends Date | number | null | undefined>
  extends AbstractBetweenValidator<T>
  implements OnChanges
{
  @Input('betweenStart') start!: NonNullable<T>;
  @Input('betweenEnd') end!: NonNullable<T>;

  @Input()
  set between(
    between: [start: NonNullable<T>, end: NonNullable<T>] | { start: NonNullable<T>; end: NonNullable<T> } | ''
  ) {
    if (isArray(between)) {
      const [start, end] = between;
      this.start = start;
      this.end = end;
    } else if (isObject(between)) {
      this.start = between.start;
      this.end = between.end;
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { between, start, end, inclusiveness } = changes;
    if (
      (between && !between.isFirstChange()) ||
      (start && !start.isFirstChange()) ||
      (end && !end.isFirstChange()) ||
      (inclusiveness && !inclusiveness.isFirstChange())
    ) {
      this.validationChange$.next();
    }
  }
}
