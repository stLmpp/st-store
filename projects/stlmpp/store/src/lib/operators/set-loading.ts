import { EntityStore } from '../entity/entity-store';
import { Store } from '../store/store';
import { defer, Observable, OperatorFunction } from 'rxjs';
import { finalize } from 'rxjs/operators';

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
