import { ID, IdGetter } from '@stlmpp/utils';
import { isDev } from './env';
import { copy } from 'copy-anything';
import { isAnyObject, isArray } from 'is-what';

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

export const devCopy = <T>(value: T): T =>
  isDev ? deepFreeze(copy(value)) : value;

export function deepFreeze<T>(object: T): T {
  if (!isDev || (!isArray(object) && !isAnyObject(object))) {
    return object;
  }
  Object.freeze(object);
  const oIsFunction = typeof object === 'function';
  const hasOwnProp = Object.prototype.hasOwnProperty;
  Object.getOwnPropertyNames(object).forEach(prop => {
    if (
      hasOwnProp.call(object, prop) &&
      (oIsFunction
        ? prop !== 'caller' && prop !== 'callee' && prop !== 'arguments'
        : true) &&
      object[prop] !== null &&
      (typeof object[prop] === 'object' ||
        typeof object[prop] === 'function') &&
      !Object.isFrozen(object[prop])
    ) {
      deepFreeze(object[prop]);
    }
  });
  return object;
}
