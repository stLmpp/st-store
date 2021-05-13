import { isNil } from 'st-utils';
import { ControlArray } from './control-array/control-array';
import { Control } from './control/control';
import { ControlGroup } from './control-group/control-group';

export function isEmptyValue(value: any): value is null | undefined | '' {
  return isNil(value) || value === '';
}

let uniqueId = 1;

export function getUniqueId(): number {
  return uniqueId++;
}

export type Entries<T = any, K extends keyof T = keyof T> = [K, T[K]][];
export type Nullable<T> = T | null | undefined;

export function isControl(value: any): value is Control {
  return value instanceof Control;
}

export function isControlGroup(value: any): value is ControlGroup {
  return value instanceof ControlGroup;
}

export function isControlArray(value: any): value is ControlArray {
  return value instanceof ControlArray;
}

export function isAnyControl(value: any): value is Control | ControlGroup | ControlArray {
  return isControl(value) || isControlGroup(value) || isControlArray(value);
}
