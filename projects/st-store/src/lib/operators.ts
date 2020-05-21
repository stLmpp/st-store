import { defer, Observable, of, OperatorFunction, throwError } from 'rxjs';
import { StStore } from './st-store';
import { catchError, finalize, tap } from 'rxjs/operators';

export const setLoading = <T>(store: StStore<any>) => (source: Observable<T>) =>
  defer(() => {
    store.setLoading(true);
    return source.pipe(
      finalize(() => {
        store.setLoading(false);
      })
    );
  });

export const setError = <T>(store: StStore<any>) =>
  catchError(err => {
    store.setError(err);
    return throwError(err);
  });

export const stCache = <T>(store: StStore<any>) => (source: Observable<T>) =>
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
