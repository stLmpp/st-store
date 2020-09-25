import { ID, IdGetter } from '@stlmpp/utils';
import { isDev } from './env';
import { copy } from 'copy-anything';
import { isArray, isNumber, isObject } from 'lodash-es';

export function toEntities<T, S extends ID = number>(
  entities: T[],
  idGetter: IdGetter<T, S>
): [{ [K in S]?: T }, Set<S>] {
  return entities.reduce(
    (acc, item) => {
      const key = idGetter(item);
      acc[0] = { ...acc[0], [key]: item };
      acc[1] = acc[1].add(key);
      return acc;
    },
    [{}, new Set<S>([])]
  );
}

export const devCopy = <T>(value: T): T => (isDev() ? deepFreeze(copy(value)) : value);

export function deepFreeze<T>(object: T): T {
  if (!isDev() || (!isArray(object) && !isObject(object))) {
    return object;
  }
  Object.freeze(object);
  const oIsFunction = typeof object === 'function';
  const hasOwnProp = Object.prototype.hasOwnProperty;
  Object.getOwnPropertyNames(object).forEach(prop => {
    if (
      hasOwnProp.call(object, prop) &&
      (oIsFunction ? prop !== 'caller' && prop !== 'callee' && prop !== 'arguments' : true) &&
      (object as any)[prop] !== null &&
      (typeof (object as any)[prop] === 'object' || typeof (object as any)[prop] === 'function') &&
      !Object.isFrozen((object as any)[prop])
    ) {
      deepFreeze((object as any)[prop]);
    }
  });
  return object;
}

export function isObjectEmpty(obj: any): boolean {
  return !obj || !isObject(obj) || !Object.keys(obj).length;
}

export function formatId<T, S extends ID = number>(object: any, idGetter: IdGetter<T, S>): (key: ID) => S {
  if (isObjectEmpty(object)) {
    return key => key as S;
  }
  return isNumber(idGetter(Object.values<T>(object)[0])) ? Number : key => key as any;
}
