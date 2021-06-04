import { Directive } from '@angular/core';
import { ControlValidator } from '../validator';
import { AbstractContainsValidators } from './contains';

@Directive({
  selector: '[model][contains]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: ContainsValidatorDirective, multi: true }],
})
export class ContainsValidatorDirective extends AbstractContainsValidators {}
