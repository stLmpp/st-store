import { Directive, forwardRef } from '@angular/core';
import { ControlValidator } from '../validator';
import { AbstractPatternValidator } from './pattern';

@Directive({
  selector: '[model][pattern]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: forwardRef(() => PatternValidatorDirective), multi: true }],
})
export class PatternValidatorDirective extends AbstractPatternValidator {}
