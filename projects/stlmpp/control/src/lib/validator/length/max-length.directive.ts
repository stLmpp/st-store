import { AbstractMaxLengthValidator } from './max-length';
import { Directive, forwardRef } from '@angular/core';
import { ControlValidator } from '../validator';
import { Nullable } from '../../util';

@Directive({
  selector: '[model][maxLength]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: forwardRef(() => MaxLengthValidatorDirective), multi: true }],
})
export class MaxLengthValidatorDirective<
  T extends Nullable<string | any[]> = any
> extends AbstractMaxLengthValidator<T> {}
