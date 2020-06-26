import { Store } from './store';
import { Observable } from 'rxjs';
import { isFunction, isString } from 'is-what';
import { distinctUntilChanged, map, pluck } from 'rxjs/operators';
import { KeyValue } from '../type';
import { isEqual } from 'lodash';

export class Query<T, E = any> {
  constructor(private __store: Store<T, E>) {}

  state$: Observable<T> = this.__store.selectState();
  loading$: Observable<boolean> = this.__store.selectLoading();
  error$: Observable<E> = this.__store.selectError();

  getState(): T {
    return this.__store.getState();
  }

  getError(): E {
    return this.__store.getError();
  }

  getLoading(): boolean {
    return this.__store.getLoading();
  }

  select(): Observable<T>;
  select<K extends keyof T>(key: K): Observable<T[K]>;
  select<R>(callback: (state: T) => R): Observable<R>;
  select<K extends keyof T, R>(callbackOrKey?: K | ((state: T) => R)): Observable<T | R | T[K]> {
    let state$: Observable<T | R | T[K]> = this.state$;
    if (callbackOrKey) {
      if (isString(callbackOrKey)) {
        state$ = state$.pipe(pluck(callbackOrKey));
      } else if (isFunction(callbackOrKey)) {
        state$ = state$.pipe(map(callbackOrKey));
      }
    }
    return state$.pipe(distinctUntilChanged(isEqual));
  }

  selectAsKeyValue(pick?: (keyof T)[]): Observable<KeyValue<string | number, any>[]> {
    let state$ = this.state$;
    if (pick?.length) {
      state$ = state$.pipe(distinctUntilChanged((a, b) => pick.every(key => isEqual(a[key], b[key]))));
    }
    return state$.pipe(
      map(state => {
        let entries = Object.entries(state);
        if (pick?.length) {
          entries = entries.filter(([key]) => (pick as string[]).includes(key));
        }
        return entries.map(([key, value]) => ({ key, value }));
      })
    );
  }
}
