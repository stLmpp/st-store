import { ControlValidator } from '../validator';
import { Control } from '../../control/control';
import { isArray } from '@stlmpp/utils';
import { Directive, Input } from '@angular/core';

@Directive()
export abstract class AbstractContainsValidators<
  T extends string | any[] = any,
  U = T extends Array<infer RealType> ? RealType : string
> extends ControlValidator<T, boolean> {
  name = 'contains';

  @Input() contains!: string | U;
  @Input() compareWith: (valueA: U, valueB: U) => boolean = Object.is;

  validate({ value }: Control<T>): boolean | null {
    if (!value) {
      return null;
    }
    if (isArray(value)) {
      return !value.some(v => this.compareWith(v, this.contains as any)) || null;
    } else {
      return !value.includes(this.contains as any) || null;
    }
  }
}

export class ContainsValidator<
  T extends string | any[] = any,
  U = T extends Array<infer RealType> ? RealType : string
> extends AbstractContainsValidators<T, U> {
  constructor(public contains: U, public compareWith: (valueA: U, valueB: U) => boolean = Object.is) {
    super();
  }
}
