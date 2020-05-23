import { isArray, isFunction } from 'is-what';
import { ID, IdGetter } from '../type';

export function removeArray<T, S extends ID = number>(
  array: T[],
  id: S,
  idGetter?: IdGetter<T, S>
): T[];
export function removeArray<T, S extends ID = number>(
  array: T[],
  ids: S[],
  idGetter?: IdGetter<T, S>
): T[];
export function removeArray<T>(
  array: T[],
  callback: (entity: T) => boolean
): T[];
export function removeArray<T, S extends ID = number>(
  array: T[],
  idOrIdsOrCallback: S | S[] | ((entity: T) => boolean),
  idGetter: IdGetter<T, S> = entity => (entity as any).id
): T[] {
  const callback = isFunction(idOrIdsOrCallback)
    ? idOrIdsOrCallback
    : isArray(idOrIdsOrCallback)
    ? entity => idOrIdsOrCallback.includes(idGetter(entity))
    : entity => idOrIdsOrCallback === idGetter(entity);
  return (array ?? []).filter(entity => !callback(entity));
}
