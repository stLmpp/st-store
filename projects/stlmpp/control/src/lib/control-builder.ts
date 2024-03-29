import { Injectable } from '@angular/core';
import { Entries } from './util';
import { isArray, isObject } from 'st-utils';
import { Control, ControlOptions } from './control/control';
import { ControlArray, ControlArrayOptions } from './control-array/control-array';
import { ControlType } from './control/control-type';
import { ControlGroup, ControlGroupOptions, ControlGroupType } from './control-group/control-group';
import { ControlValidator } from './validator/validator';
import { isAnyControl } from './is-any-control';

export type ControlBuilderTuple<T> = [value: T, validatorsOrOptions?: ControlOptions<T> | ControlValidator<T>[]];

export type ControlBuilderGroup<T extends Record<any, any>> = {
  [K in keyof T]: ControlBuilderGroupItem<T[K]>;
};

export type ControlBuilderGroupItem<T> = [T] extends [Control<infer C>]
  ? Control<C>
  : [T] extends [Array<infer U>]
  ? ControlArray<U>
  : [T] extends [Record<any, any>]
  ? ControlBuilderGroup<T>
  : ControlBuilderTuple<T> | T | Control<T>;

@Injectable({ providedIn: 'root' })
export class ControlBuilder {
  control<T>(value: T, options?: ControlValidator<T> | ControlValidator<T>[] | ControlOptions<T>): Control;
  control<T>(tuple: ControlBuilderTuple<T>): Control;
  control<T>(
    value: T | ControlBuilderTuple<T>,
    options?: ControlValidator | ControlValidator[] | ControlOptions
  ): Control {
    if (isArray(value)) {
      const [realValue, realOptions] = value;
      return new Control<T>(realValue, realOptions);
    } else {
      return new Control<T>(value, options);
    }
  }

  group<T>(controls: ControlBuilderGroup<T>, options?: ControlGroupOptions): ControlGroup<T> {
    const newControls: ControlGroupType<any> = (Object.entries(controls) as Entries<ControlBuilderGroup<T>>).reduce(
      (acc: Record<any, any>, [key, value]) => {
        if (isAnyControl(value)) {
          acc[key] = value;
        } else if (isObject(value) && !isArray(value)) {
          acc[key] = this.group(value as any);
        } else {
          acc[key] = this.control(value);
        }
        return acc;
      },
      {}
    );
    return new ControlGroup<T>(newControls, options);
  }

  array<T extends any[]>(controls: ControlArray<T>[], options?: ControlArrayOptions): ControlArray<T>;
  array<T extends Record<any, any>>(controls: ControlGroupType<T>[], options?: ControlArrayOptions): ControlArray<T>;
  array<T extends Record<any, any>>(controls: ControlBuilderGroup<T>[], options?: ControlArrayOptions): ControlArray<T>;
  array<T extends Record<any, any>>(controls: ControlGroup<T>[], options?: ControlArrayOptions): ControlArray<T>;
  array<T>(controls: T[], options?: ControlArrayOptions): ControlArray<T>;
  array<T>(controls: ControlBuilderTuple<T>[], options?: ControlArrayOptions): ControlArray<T>;
  array<T>(controls: Control<T>[], options?: ControlArrayOptions): ControlArray<T>;
  array<T>(
    controls: Array<ControlBuilderTuple<T> | Control<T> | ControlGroup<T> | ControlArray<T> | ControlBuilderGroup<T>>,
    options?: ControlArrayOptions
  ): ControlArray<T> {
    if (!controls.length) {
      return new ControlArray<T>([], options);
    } else {
      const newControls: ControlType<any>[] = controls.map(control => {
        if (control instanceof Control || control instanceof ControlGroup || control instanceof ControlArray) {
          // Can't use isAnyControl here, because the type guard is not working properly
          return control;
        } else if (isArray(control)) {
          return this.control<T>(control);
        } else if (!isObject(control)) {
          return this.control<T>(control);
        } else {
          return this.group<T>(control);
        }
      });
      return new ControlArray<T>(newControls, options);
    }
  }
}
