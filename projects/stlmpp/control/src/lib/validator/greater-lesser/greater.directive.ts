import { Directive } from '@angular/core';
import { AbstractGreaterValidator } from './greater';
import { ControlValidator } from '../validator';

@Directive({
  selector: '[model][greater]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: GreaterValidatorDirective, multi: true }],
})
export class GreaterValidatorDirective<
  T extends Date | number | null | undefined
> extends AbstractGreaterValidator<T> {}
