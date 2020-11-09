import { ControlValidator } from './validator';
import { Control } from '../control';
import { isArray } from '@stlmpp/utils';

export class ContainsValidator<T extends string | any[] = any, U = T extends Array<infer RealType> ? RealType : string>
  implements ControlValidator<T, boolean> {
  constructor(private compare: U, private compareWith: (valueA: U, valueB: U) => boolean = Object.is) {}

  name = 'contains';

  validate({ value }: Control<T>): boolean | null {
    if (!value) {
      return null;
    }
    if (isArray(value)) {
      return !value.some(v => this.compareWith(v, this.compare)) || null;
    } else {
      return !value.includes(this.compare as any) || null;
    }
  }
}
