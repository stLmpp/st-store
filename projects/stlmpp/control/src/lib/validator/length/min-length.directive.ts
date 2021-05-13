import { AbstractMinLengthValidator } from './min-length';
import { Directive } from '@angular/core';
import { ControlValidator } from '../validator';
import { Nullable } from '../../util';

@Directive({
  selector: '[model][minLength]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: MinLengthValidatorDirective, multi: true }],
})
export class MinLengthValidatorDirective<
  T extends Nullable<string | any[]> = any
> extends AbstractMinLengthValidator<T> {}
