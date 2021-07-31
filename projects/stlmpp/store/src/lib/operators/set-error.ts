import { EntityStore } from '../entity/entity-store';
import { Store } from '../store/store';
import { catchError, OperatorFunction, throwError } from 'rxjs';

/**
 * @description when an error occurs, set it to the store
 * @param {EntityStore | Store} store
 * @returns {OperatorFunction<T, T>}
 */
export function setError<T>(store: EntityStore | Store<any>): OperatorFunction<T, T> {
  return catchError(err => {
    store.setError(err);
    return throwError(() => err);
  });
}
