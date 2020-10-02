import { ID, IdGetter } from '@stlmpp/utils';
import { environment } from './environment';
import { copy } from 'copy-anything';
import { isArray, isNumber, isObject } from 'lodash-es';
import { MonoTypeOperatorFunction } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

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

export const devCopy = <T>(value: T): T => {
  if (environment.isDev) {
    if (environment.copyData) {
      value = copy(value);
    }
    if (environment.freezeData) {
      value = deepFreeze(value);
    }
  }
  return value;
};

export function deepFreeze<T>(object: T): T {
  if (!object || !isObject(object)) {
    return object;
  }
  if (!Object.isFrozen(object)) {
    Object.freeze(object);
  }
  if (isArray(object)) {
    for (const item of object) {
      deepFreeze(item);
    }
  } else {
    for (const value of Object.values(object)) {
      if (!Object.isFrozen(value)) {
        deepFreeze(value);
      }
    }
  }
  return object;
}

export function isObjectEmpty(obj: any): boolean {
  return !obj || !isObject(obj) || !Object.keys(obj).length;
}

export function predictIdType<T, S extends ID = number>(object: any, idGetter: IdGetter<T, S>): (key: ID) => S {
  if (isObjectEmpty(object)) {
    return key => key as S;
  }
  return isNumber(idGetter(Object.values<T>(object)[0])) ? Number : key => key as any;
}

export function distinctUntilManyChanged<T = any>(): MonoTypeOperatorFunction<T[]> {
  return distinctUntilChanged<T[]>((manyA: T[], manyB: T[]) => {
    if (manyA === manyB) {
      return true;
    }
    if ((!manyA && manyB) || (manyA && !manyB) || manyA.length !== manyB.length) {
      return false;
    }
    let index = manyA.length;
    while (index--) {
      if (manyA[index] !== manyB[index]) {
        return false;
      }
    }
    return true;
  });
}
