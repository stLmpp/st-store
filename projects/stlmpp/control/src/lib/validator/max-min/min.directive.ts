import { Directive } from '@angular/core';
import { ControlValidator } from '../validator';
import { AbstractMinValidator } from './min';
import { Nullable } from '../../util';

@Directive({
  selector: '[model][min]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: MinValidatorDirective, multi: true }],
})
export class MinValidatorDirective<T extends Nullable<Date | number>> extends AbstractMinValidator<T> {}
