import { EntityStore } from '../entity/entity-store';
import { Store } from '../store/store';
import { defer, finalize, MonoTypeOperatorFunction, Observable } from 'rxjs';

/**
 * @description set the loading state while the observable is being resolved
 * @template T
 * @param {EntityStore | Store} store
 * @returns {MonoTypeOperatorFunction<T>}
 */
export function setLoading<T>(store: EntityStore | Store<any>): MonoTypeOperatorFunction<T> {
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
