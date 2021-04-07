import { EntityStore } from '../entity/entity-store';
import { Store } from '../store/store';
import { OperatorFunction, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export function setError<T>(store: EntityStore | Store<any>): OperatorFunction<T, T> {
  return catchError(err => {
    store.setError(err);
    return throwError(err);
  });
}
