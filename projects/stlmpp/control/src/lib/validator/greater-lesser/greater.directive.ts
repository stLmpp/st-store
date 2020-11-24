import { Directive, forwardRef } from '@angular/core';
import { AbstractGreaterValidator } from './greater';
import { ControlValidator } from '../validator';

@Directive({
  selector: '[model][greater]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: forwardRef(() => GreaterValidatorDirective), multi: true }],
})
export class GreaterValidatorDirective<T extends Date | number> extends AbstractGreaterValidator<T> {}
