import { isArray, isFunction } from 'lodash-es';
import { ID, IdGetterType } from '../type';
import { idGetterFactory } from '../util';

export function removeArray<T, S extends ID = number>(array: T[], id: S, idGetter?: IdGetterType<T, S>): T[];
export function removeArray<T, S extends ID = number>(array: T[], ids: S[], idGetter?: IdGetterType<T, S>): T[];
export function removeArray<T>(array: T[], callback: (entity: T, index: number) => boolean): T[];
export function removeArray<T, S extends ID = number>(
  array: T[],
  idOrIdsOrCallback: S | S[] | ((entity: T, index: number) => boolean),
  _idGetter: IdGetterType<T, S> = 'id'
): T[] {
  const idGetter = idGetterFactory(_idGetter);
  const callback: (entity: T, index: number) => boolean = isFunction(idOrIdsOrCallback)
    ? idOrIdsOrCallback
    : isArray(idOrIdsOrCallback)
    ? entity => idOrIdsOrCallback.includes(idGetter(entity))
    : entity => idOrIdsOrCallback === idGetter(entity);
  return (array ?? []).filter((entity, index) => !callback(entity, index));
}
