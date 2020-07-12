import { updateArray } from './update-array';
import { addArray } from './add-array';
import { IdGetter, IdGetterType } from '../type';
import { isArray } from 'lodash-es';
import { idGetterFactory } from '../util';

export function upsertArray<T>(array: T[], newItem: T | Partial<T>, idGetter?: IdGetterType<T>): T[];
export function upsertArray<T>(array: T[], newItems: Array<T | Partial<T>>, idGetter?: IdGetterType<T>): T[];
export function upsertArray<T>(
  array: T[],
  newItem: T | Partial<T> | Array<T | Partial<T>>,
  _idGetter: IdGetterType<T> = 'id'
): T[] {
  const idGetter = idGetterFactory(_idGetter);
  if (isArray(newItem)) {
    return upsertMany(array, newItem, idGetter);
  } else {
    return upsertOne(array, newItem, idGetter);
  }
}

export function upsertOne<T>(array: T[], newItem: T | Partial<T>, idGetter: IdGetter<T>): T[] {
  if (array.some(item => idGetter(item) === idGetter(newItem as any))) {
    return updateArray(array, idGetter(newItem as any), newItem);
  } else if (idGetter(newItem as any)) {
    return addArray(array, newItem as T);
  }
}

export function upsertMany<T>(array: T[], newItems: Array<T | Partial<T>>, idGetter: IdGetter<T>): T[] {
  const ids = [...new Set([...array.map(idGetter), ...newItems.map(idGetter)])];
  return ids.reduce((acc, id) => {
    const item = array.find(value => idGetter(value) === id);
    const newItem = newItems.find(value => idGetter(value as T) === id);
    return [...acc, { ...item, ...newItem }];
  }, []);
}
