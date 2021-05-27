import { Subject } from 'rxjs';
import { ControlState } from '../control/control';

export abstract class ControlValue<T = any> {
  readonly onChange$ = new Subject<T>();
  readonly onTouched$ = new Subject<void>();

  setDisabled?(disabled: boolean): void;
  stateChanged?(state: ControlState): void;
  focus?(): void;
  abstract setValue(value: T): void;
}
