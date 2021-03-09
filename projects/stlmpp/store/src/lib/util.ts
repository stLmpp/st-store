import { isArray, isNumber, isObject, isObjectEmpty, IdGetterFn, isString } from 'st-utils';
import { environment } from './environment';
import { copy } from 'copy-anything';
import { MonoTypeOperatorFunction } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';
import { EntityIdType } from './type';

export function toEntities<T extends Record<any, any>>(
  entities: T[],
  idGetter: IdGetterFn<T>
): [{ [id: string]: T }, Set<EntityIdType>] {
  return entities.reduce(
    (acc, item) => {
      const key = idGetter(item);
      acc[0] = { ...acc[0], [key]: item };
      acc[1] = acc[1].add(key);
      return acc;
    },
    [{}, new Set<EntityIdType>([])]
  );
}

export function devCopy<T>(value: T): T {
  if (typeof ngDevMode === 'undefined' || ngDevMode) {
    if (environment.isDev) {
      if (environment.copyData) {
        value = copy(value);
      }
      if (environment.freezeData) {
        value = deepFreeze(value);
      }
    }
  }
  return value;
}

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

export function predictIdType<T extends Record<any, any>>(
  object: { [id: string]: T },
  idGetter: IdGetterFn<T>
): (key: EntityIdType) => EntityIdType {
  if (!object || isObjectEmpty(object)) {
    return key => key;
  }
  const firstKey = getFirstKey(object);
  // Non-null assertion here because I checked if the object is empty before
  const firstItem = object[firstKey!];
  return isNumber(idGetter(firstItem)) ? Number : key => key;
}

export function getFirstKey<T extends Record<any, any>>(object: T): keyof T | undefined {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      return key;
    }
  }
  return undefined;
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

export function isEntityId(value: any): value is EntityIdType {
  return isNumber(value) || isString(value);
}
