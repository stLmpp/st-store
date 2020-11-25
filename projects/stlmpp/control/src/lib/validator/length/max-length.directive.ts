import { AbstractMaxLengthValidator } from './max-length';
import { Directive, forwardRef } from '@angular/core';
import { ControlValidator } from '../validator';

@Directive({
  selector: '[model][maxLength]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: forwardRef(() => MaxLengthValidatorDirective), multi: true }],
})
export class MaxLengthValidatorDirective<T extends string | any[] = any> extends AbstractMaxLengthValidator<T> {}
