import { ControlValidator } from '../validator';
import { Control } from '../../control/control';
import { isArray } from 'st-utils';
import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Nullable } from '../../util';

@Directive()
export abstract class AbstractContainsValidators<
    T extends Nullable<string | any[]> = any,
    U = [T] extends [Array<infer RealType>] ? RealType : string
  >
  extends ControlValidator<T, boolean>
  implements OnChanges
{
  @Input() contains!: string | NonNullable<U>;
  @Input() compareWith: (valueA: NonNullable<U>, valueB: NonNullable<U>) => boolean = Object.is;

  readonly name = 'contains';

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

  ngOnChanges(changes: SimpleChanges): void {
    const { contains, compareWith } = changes;
    if ((contains && !contains.isFirstChange()) || (compareWith && !compareWith.isFirstChange())) {
      this.validationChange$.next();
    }
  }
}

export class ContainsValidator<
  T extends Nullable<string | any[]> = any,
  U = T extends Array<infer RealType> ? RealType : string
> extends AbstractContainsValidators<T, U> {
  constructor(
    public contains: NonNullable<U>,
    public compareWith: (valueA: NonNullable<U>, valueB: NonNullable<U>) => boolean = Object.is
  ) {
    super();
  }
}
