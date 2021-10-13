import { AbstractMaxLengthValidator } from './max-length';
import { Directive } from '@angular/core';
import { ControlValidator } from '../validator';

@Directive({
  selector: '[model][maxLength]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: MaxLengthValidatorDirective, multi: true }],
})
export class MaxLengthValidatorDirective<
  T extends string | any[] | null | undefined = any
> extends AbstractMaxLengthValidator<T> {}
