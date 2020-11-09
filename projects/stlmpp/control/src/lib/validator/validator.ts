import { Control } from '../control/control';
import { Observable } from 'rxjs';

export type ControlValidatorAttributes = Record<string, string | number | boolean | undefined>;

export interface ControlValidator<T = any, E = any> {
  name: string;
  attrs?: ControlValidatorAttributes;
  classes?: string | ReadonlyArray<string>;
  async?: boolean;
  validate(control: Control<T>): E | Observable<E> | null | Observable<null>;
}
