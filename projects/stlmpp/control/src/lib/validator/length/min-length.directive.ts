import { AbstractMinLengthValidator } from './min-length';
import { Directive } from '@angular/core';
import { ControlValidator } from '../validator';

@Directive({
  selector: '[model][minLength]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: MinLengthValidatorDirective, multi: true }],
})
export class MinLengthValidatorDirective<
  T extends string | any[] | null | undefined = any
> extends AbstractMinLengthValidator<T> {}
