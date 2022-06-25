import { EntityStore } from '../entity/entity-store';
import { EntityIdType, EntityState } from '../type';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';

/**
 * @description same as {@link useCache}, but for one specific entity
 * @template T
 * @param {EntityIdType} id
 * @param {EntityStore<EntityState>} store
 * @returns {MonoTypeOperatorFunction<T>}
 */
export function useEntityCache<T>(id: EntityIdType, store: EntityStore<EntityState<any>>): MonoTypeOperatorFunction<T> {
  return source =>
    new Observable<T>(subscriber => {
      const entity = store.getState().entities.get(id);
      if (entity) {
        subscriber.next(entity);
        subscriber.complete();
      } else {
        source.subscribe({
          next(value): void {
            subscriber.next(value);
          },
          error(err): void {
            subscriber.error(err);
          },
          complete(): void {
            subscriber.complete();
          },
        });
      }
    });
}
