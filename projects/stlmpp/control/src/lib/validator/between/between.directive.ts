import { Directive, forwardRef, Input } from '@angular/core';
import { ControlValidator } from '../validator';
import { AbstractBetweenValidator } from './between';
import { isArray } from '@stlmpp/utils';

@Directive({
  selector: '[model][between][betweenStart][betweenEnd]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: forwardRef(() => ControlValidator), multi: true }],
})
export class BetweenValidatorDirective<T extends Date | number> extends AbstractBetweenValidator<T> {
  @Input('betweenStart') end!: T;
  @Input('betweenEnd') start!: T;

  @Input()
  set between(between: [T, T] | { start: T; end: T }) {
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
