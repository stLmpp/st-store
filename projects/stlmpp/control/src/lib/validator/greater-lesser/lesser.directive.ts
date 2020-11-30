import { AbstractLesserValidator } from './lesser';
import { Directive, forwardRef } from '@angular/core';
import { ControlValidator } from '../validator';
import { Nullable } from '../../util';

@Directive({
  selector: '[model][lesser]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: forwardRef(() => LesserValidatorDirective), multi: true }],
})
export class LesserValidatorDirective<T extends Nullable<Date | number>> extends AbstractLesserValidator<T> {}
