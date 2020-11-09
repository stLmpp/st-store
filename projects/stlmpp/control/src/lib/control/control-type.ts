import { Control } from './control';
import { ControlArray } from '../control-array/control-array';
import { ControlGroup } from '../control-group/control-group';

export type ControlType<T> = [T] extends [Control]
  ? T
  : [T] extends [Array<infer U>]
  ? ControlArray<U>
  : [T] extends [Record<any, any>]
  ? ControlGroup<T>
  : Control<T>;
