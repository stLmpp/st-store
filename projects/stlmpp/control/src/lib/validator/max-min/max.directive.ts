import { Directive } from '@angular/core';
import { AbstractMaxValidator } from './max';
import { ControlValidator } from '../validator';

@Directive({
  selector: '[model][max]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: MaxValidatorDirective, multi: true }],
})
export class MaxValidatorDirective<T extends Date | number | null | undefined> extends AbstractMaxValidator<T> {}
