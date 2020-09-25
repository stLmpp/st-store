import { ID, IdGetter, IdGetterType } from './type';
import { isArray, isFunction, isNumber, isString } from 'lodash-es';
import { getDeep } from './get-deep';

export function isID(value: any): value is ID {
  return isString(value) || isNumber(value);
}

export function idGetterFactory<T, S extends ID = number>(property: keyof T): IdGetter<T, S>;
export function idGetterFactory<T, S extends ID = number>(nested: string): IdGetter<T, S>;
export function idGetterFactory<T, S extends ID = number>(nested: string[]): IdGetter<T, S>;
export function idGetterFactory<T, S extends ID = number>(fn: IdGetter<T, S>): IdGetter<T, S>;
export function idGetterFactory<T, S extends ID = number>(): IdGetter<T, S>;
export function idGetterFactory<T, S extends ID = number>(arg?: IdGetterType<T, S>): IdGetter<T, S>;
export function idGetterFactory<T, S extends ID = number>(arg?: IdGetterType<T, S>): IdGetter<T, S> {
  if (!arg) {
    return entity => (entity as any).id;
  } else if (isFunction(arg)) {
    return arg;
  } else if (isString(arg)) {
    if (arg.includes('.')) {
      return entity => getDeep(entity, arg);
    } else {
      return entity => (entity as any)[arg];
    }
  } else if (isArray(arg)) {
    return entity => getDeep(entity, arg as string[]);
  } else {
    return entity => (entity as any).id;
  }
}
