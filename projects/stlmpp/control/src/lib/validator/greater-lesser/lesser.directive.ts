import { AbstractLesserValidator } from './lesser';
import { Directive } from '@angular/core';
import { ControlValidator } from '../validator';

@Directive({
  selector: '[model][lesser]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: LesserValidatorDirective, multi: true }],
})
export class LesserValidatorDirective<T extends Date | number | null | undefined> extends AbstractLesserValidator<T> {}
