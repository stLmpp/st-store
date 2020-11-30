import { Directive, forwardRef } from '@angular/core';
import { AbstractMaxValidator } from './max';
import { ControlValidator } from '../validator';
import { Nullable } from '../../util';

@Directive({
  selector: '[model][max]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: forwardRef(() => MaxValidatorDirective), multi: true }],
})
export class MaxValidatorDirective<T extends Nullable<Date | number>> extends AbstractMaxValidator<T> {}
