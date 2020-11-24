import { Control } from '../control/control';
import { Observable } from 'rxjs';

export type ControlValidatorAttributes = Record<string, string | number | boolean | undefined>;

export abstract class ControlValidator<T = any, E = any> {
  abstract name: string;
  attrs?: ControlValidatorAttributes;
  classes?: string | ReadonlyArray<string>;
  async?: boolean;
  abstract validate(control: Control<T>): E | Observable<E> | null | Observable<null>;
}
