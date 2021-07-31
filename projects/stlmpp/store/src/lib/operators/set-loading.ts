import { EntityStore } from '../entity/entity-store';
import { Store } from '../store/store';
import { defer, finalize, Observable, OperatorFunction } from 'rxjs';

/**
 * @description set the loading state while the observable is being resolved
 * @param {EntityStore | Store} store
 * @returns {OperatorFunction<T, T>}
 */
export function setLoading<T>(store: EntityStore | Store<any>): OperatorFunction<T, T> {
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
