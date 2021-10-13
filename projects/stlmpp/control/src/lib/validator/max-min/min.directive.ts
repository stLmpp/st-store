import { Directive } from '@angular/core';
import { ControlValidator } from '../validator';
import { AbstractMinValidator } from './min';

@Directive({
  selector: '[model][min]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: MinValidatorDirective, multi: true }],
})
export class MinValidatorDirective<T extends Date | number | null | undefined> extends AbstractMinValidator<T> {}
