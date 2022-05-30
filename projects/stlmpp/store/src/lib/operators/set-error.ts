import { EntityStore } from '../entity/entity-store';
import { Store } from '../store/store';
import { catchError, MonoTypeOperatorFunction, throwError } from 'rxjs';

/**
 * @description when an error occurs, set it to the store
 * @template T
 * @param {EntityStore | Store} store
 * @returns {MonoTypeOperatorFunction<T>}
 */
export function setError<T>(store: EntityStore | Store<any>): MonoTypeOperatorFunction<T> {
  return catchError(err => {
    store.setError(err);
    return throwError(() => err);
  });
}
