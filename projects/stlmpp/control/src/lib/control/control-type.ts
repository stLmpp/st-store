import { ControlArray } from '../control-array';
import { ControlGroup } from '../control-group';
import { Control } from './control';

export type ControlType<T> = [T] extends [Control]
  ? T
  : [T] extends [Array<infer U>]
  ? ControlArray<U>
  : [T] extends [Record<any, any>]
  ? ControlGroup<T>
  : Control<T>;
