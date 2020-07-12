import { defer, Observable, OperatorFunction, throwError } from 'rxjs';
import { EntityStore } from './entity/entity-store';
import { catchError, finalize } from 'rxjs/operators';
import { Store } from './store/store';

export function setLoading<T>(store: EntityStore<any> | Store<any>): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    defer(() => {
      store.setLoading(true);
      return source.pipe(
        finalize(() => {
          store.setLoading(false);
        })
      );
    });
}

export function setError<T>(store: EntityStore<any> | Store<any>): OperatorFunction<T, T> {
  return catchError(err => {
    store.setError(err);
    return throwError(err);
  });
}

export function useCache<T>(store: EntityStore<any> | Store<any>): OperatorFunction<T, T> {
  return (source: Observable<T>) =>
    new Observable<T>(subscriber => {
      if (store.hasCache()) {
        const currentState = store instanceof Store ? store.getState() : store.getState().entities.values;
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
