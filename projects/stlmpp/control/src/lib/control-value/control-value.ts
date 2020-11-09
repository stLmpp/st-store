import { Subject } from 'rxjs';
import { ControlState } from '../control/control';

export abstract class ControlValue<T = any> {
  onChange$ = new Subject<T | null | undefined>();
  onTouched$ = new Subject<void>();

  abstract setValue(value: T | null | undefined): void;
  setDisabled?(disabled: boolean): void;
  stateChanged?(state: ControlState): void;
}
