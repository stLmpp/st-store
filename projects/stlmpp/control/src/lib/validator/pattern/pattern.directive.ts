import { Directive, forwardRef } from '@angular/core';
import { ControlValidator } from '../validator';

@Directive({
  selector: '[model][pattern]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: forwardRef(() => PatternValidatorDirective), multi: true }],
})
export class PatternValidatorDirective {}
