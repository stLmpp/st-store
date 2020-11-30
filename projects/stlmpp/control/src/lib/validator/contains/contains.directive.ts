import { Directive, forwardRef } from '@angular/core';
import { ControlValidator } from '../validator';
import { AbstractContainsValidators } from './contains';
import { Nullable } from '../../util';

@Directive({
  selector: '[model][contains]:not([control]):not([controlName])',
  providers: [{ provide: ControlValidator, useExisting: forwardRef(() => ContainsValidatorDirective), multi: true }],
})
export class ContainsValidatorDirective<
  T extends Nullable<string | any[]> = any,
  U = T extends Array<infer RealType> ? RealType : string
> extends AbstractContainsValidators<T, U> {}
