import { Control } from '../control/control';
import { Observable, Subject } from 'rxjs';

export type ControlValidatorAttributes = Record<string, string | number | boolean | undefined>;

export abstract class ControlValidator<T = any, E = any> {
  abstract readonly name: string;
  readonly validationChange$ = new Subject<void>();
  attrs?: ControlValidatorAttributes;
  classes?: string | ReadonlyArray<string>;
  readonly async: boolean = false;
  abstract validate(control: Control<T>): E | Observable<E | null> | null;
}
