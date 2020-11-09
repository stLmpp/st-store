import { ID, IdGetterType } from '../type';
import { idGetterFactory, isArray, isFunction } from '../util';

export function updateArray<T, S extends ID = number>(
  array: T[],
  id: S,
  partial: Partial<T> | ((entity: T) => T),
  idGetter?: IdGetterType<T, S>
): T[];
export function updateArray<T, S extends ID = number>(
  array: T[],
  ids: S[],
  partial: Partial<T> | ((entity: T) => T),
  idGetter?: IdGetterType<T, S>
): T[];
export function updateArray<T>(
  array: T[],
  callback: (entity: T, index: number) => boolean,
  partial: Partial<T> | ((entity: T) => T)
): T[];
export function updateArray<T, S extends ID = number>(
  array: T[],
  idOrIdsOrCallback: S | S[] | ((entity: T, index: number) => boolean),
  partial: Partial<T> | ((entity: T) => T),
  _idGetter: IdGetterType<T, S> = 'id'
): T[] {
  const idGetter = idGetterFactory(_idGetter);
  const callback: (entity: T, index: number) => boolean = isFunction(idOrIdsOrCallback)
    ? idOrIdsOrCallback
    : isArray(idOrIdsOrCallback)
    ? entity => idOrIdsOrCallback.includes(idGetter(entity))
    : entity => idOrIdsOrCallback === idGetter(entity);
  const updateCallback = isFunction(partial) ? partial : (entity: T) => ({ ...entity, ...partial });
  return (array ?? []).map((item, index) => {
    if (callback(item, index)) {
      item = { ...item, ...updateCallback(item) };
    }
    return item;
  });
}
