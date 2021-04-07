import { EntityStore } from '../entity/entity-store';
import { Store } from '../store/store';
import { Observable, OperatorFunction } from 'rxjs';

export function useCache<T>(store: EntityStore | Store<any>): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>(subscriber => {
      if (store.hasCache()) {
        let currentState = store.getState();
        if (store instanceof EntityStore) {
          currentState = currentState.entities.values;
        }
        subscriber.next(currentState);
        subscriber.complete();
        store.setLoading(false);
      } else {
        source.subscribe({
          next(value): void {
            store.setHasCache(true);
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
