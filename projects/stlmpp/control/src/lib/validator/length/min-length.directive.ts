import { AbstractMinLengthValidator } from './min-length';
import { Directive, forwardRef } from '@angular/core';
import { ControlValidator } from '../validator';

@Directive({
  selector: '[model][minLength]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: forwardRef(() => MinLengthValidatorDirective), multi: true }],
})
export class MinLengthValidatorDirective<T extends string | any[] = any> extends AbstractMinLengthValidator {}
