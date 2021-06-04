import { getFirstKey, IdGetterFn, isArray, isNumber, isObject, isObjectEmpty, isString } from 'st-utils';
import { environment } from './environment';
import { copy } from 'copy-anything';
import { EntityIdType } from './type';

/**
 * @description Transform an array of objects with an id, to an object of entities,
 * <br> and returns the object and an {@link Set} of ids
 * @param {T[]} entities
 * @param {IdGetterFn<T>} idGetter
 * @returns {[Record<string, T>, Set<EntityIdType>]}
 */
export function toEntities<T extends Record<any, any>>(
  entities: T[],
  idGetter: IdGetterFn<T>
): [Record<string, T>, Set<EntityIdType>] {
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

/**
 * @description Deep copy and deep freeze an object in development mode
 * @param {T} value
 * @returns {T}
 */
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

/**
 * @description Deep freeze an object
 * @param {T} object
 * @returns {T}
 */
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

/**
 * @description tries to predict if the id is a number or string
 * @param {Record<string, T>} object
 * @param {IdGetterFn<T>} idGetter
 * @returns {(key: EntityIdType) => EntityIdType}
 */
export function predictIdType<T extends Record<any, any>>(
  object: Record<string, T>,
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

/**
 * @description check if a value is {@link EntityIdType}
 * @param value
 * @returns {value is EntityIdType}
 */
export function isEntityId(value: any): value is EntityIdType {
  return isNumber(value) || isString(value);
}
