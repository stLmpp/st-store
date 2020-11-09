import { updateArray } from './update-array';
import { addArray } from './add-array';
import { IdGetter, IdGetterType } from '../type';
import { idGetterFactory, isArray, isNil } from '../util';

export function upsertArray<T>(array: T[], newItem: T | Partial<T>, idGetter?: IdGetterType<T>): T[];
export function upsertArray<T>(array: T[], newItems: Array<T | Partial<T>>, idGetter?: IdGetterType<T>): T[];
export function upsertArray<T>(
  array: T[],
  newItem: T | Partial<T> | Array<T | Partial<T>>,
  _idGetter: IdGetterType<T> = 'id'
): T[] {
  array ??= [];
  if (!newItem) {
    return array;
  }
  const idGetter = idGetterFactory(_idGetter);
  if (isArray(newItem)) {
    return upsertMany(array, newItem, idGetter);
  } else {
    return upsertOne(array, newItem, idGetter);
  }
}

export function upsertOne<T>(array: T[], newItem: T | Partial<T>, idGetter: IdGetter<T>): T[] {
  const newItemId = idGetter(newItem as T);
  if (isNil(newItemId)) {
    return array;
  }
  if (array.some(item => idGetter(item) === newItemId)) {
    return updateArray(array, newItemId, newItem);
  } else {
    return addArray(array, newItem as T);
  }
}

export function upsertMany<T>(array: T[], newItems: Array<T | Partial<T>>, idGetter: IdGetter<T>): T[] {
  if (!newItems.length) {
    return array;
  }
  const ids = [...new Set([...array.map(idGetter), ...newItems.map(entity => idGetter(entity as T))])];
  return ids.reduce((acc, id) => {
    const item = array.find(value => idGetter(value) === id);
    const newItem = newItems.find(value => idGetter(value as T) === id);
    return [...acc, { ...item, ...newItem }] as T[];
  }, [] as T[]);
}
