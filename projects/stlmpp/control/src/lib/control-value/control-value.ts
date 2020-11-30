import { Subject } from 'rxjs';
import { ControlState } from '../control/control';

export abstract class ControlValue<T = any> {
  onChange$ = new Subject<T>();
  onTouched$ = new Subject<void>();

  setDisabled?(disabled: boolean): void;
  stateChanged?(state: ControlState): void;
  abstract setValue(value: T): void;
}
