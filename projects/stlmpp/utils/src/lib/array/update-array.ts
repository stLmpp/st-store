import { isArray, isFunction } from 'is-what';
import { ID, IdGetter } from '../type';
import { DeepPartial } from '../deep-partial';
import { deepMerge } from '../deep-merge';

export function updateArray<T, S extends ID = number>(
  array: T[],
  id: S,
  partial: Partial<T> | DeepPartial<T>,
  idGetter?: IdGetter<T, S>
): T[];
export function updateArray<T, S extends ID = number>(
  array: T[],
  ids: S[],
  partial: Partial<T> | DeepPartial<T>,
  idGetter?: IdGetter<T, S>
): T[];
export function updateArray<T>(
  array: T[],
  callback: (entity: T) => boolean,
  partial: Partial<T> | DeepPartial<T>
): T[];
export function updateArray<T, S extends ID = number>(
  array: T[],
  idOrIdsOrCallback: S | S[] | ((entity: T) => boolean),
  partial: Partial<T> | DeepPartial<T>,
  idGetter: IdGetter<T, S> = entity => (entity as any).id
): T[] {
  const callback = isFunction(idOrIdsOrCallback)
    ? idOrIdsOrCallback
    : isArray(idOrIdsOrCallback)
    ? entity => idOrIdsOrCallback.includes(idGetter(entity))
    : entity => idOrIdsOrCallback === idGetter(entity);
  return (array ?? []).map(item => {
    if (callback(item)) {
      item = deepMerge(item, partial);
    }
    return item;
  });
}
