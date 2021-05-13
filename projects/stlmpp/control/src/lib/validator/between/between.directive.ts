import { Directive, Input } from '@angular/core';
import { ControlValidator } from '../validator';
import { AbstractBetweenValidator } from './between';
import { isArray } from 'st-utils';
import { Nullable } from '../../util';

@Directive({
  selector: '[model][between]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: BetweenValidatorDirective, multi: true }],
})
export class BetweenValidatorDirective<T extends Nullable<Date | number>> extends AbstractBetweenValidator<T> {
  @Input('betweenStart') end!: NonNullable<T>;
  @Input('betweenEnd') start!: NonNullable<T>;

  @Input()
  set between(between: [start: NonNullable<T>, end: NonNullable<T>] | { start: NonNullable<T>; end: NonNullable<T> }) {
    if (isArray(between)) {
      const [start, end] = between;
      this.start = start;
      this.end = end;
    } else {
      this.start = between.start;
      this.end = between.end;
    }
  }
}
