import { EntityStore } from '../entity/entity-store';
import { EntityIdType, EntityState } from '../type';
import { MonoTypeOperatorFunction, Observable } from 'rxjs';

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
