import { Directive } from '@angular/core';
import { AbstractGreaterValidator } from './greater';
import { ControlValidator } from '../validator';
import { Nullable } from '../../util';

@Directive({
  selector: '[model][greater]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: GreaterValidatorDirective, multi: true }],
})
export class GreaterValidatorDirective<T extends Nullable<Date | number>> extends AbstractGreaterValidator<T> {}
