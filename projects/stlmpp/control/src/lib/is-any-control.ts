import { Control, isControl } from './control/control';
import { ControlGroup, isControlGroup } from './control-group/control-group';
import { ControlArray, isControlArray } from './control-array/control-array';

export function isAnyControl(value: any): value is Control | ControlGroup | ControlArray {
  return isControl(value) || isControlGroup(value) || isControlArray(value);
}
