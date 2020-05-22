import { defer, Observable, throwError } from 'rxjs';
import { EntityStore } from './entity/entity-store';
import { catchError, finalize } from 'rxjs/operators';
import { Store } from './store/store';

export const setLoading = <T>(store: EntityStore<any> | Store<any>) => (
  source: Observable<T>
) =>
  defer(() => {
    store.setLoading(true);
    return source.pipe(
      finalize(() => {
        store.setLoading(false);
      })
    );
  });

export const setError = <T>(store: EntityStore<any> | Store<any>) =>
  catchError(err => {
    store.setError(err);
    return throwError(err);
  });

export const stCache = <T>(store: EntityStore<any>) => (
  source: Observable<T>
) =>
  new Observable<T>(subscriber => {
    if (store.hasCache()) {
      subscriber.next(store.getState().entities.values() as any);
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
