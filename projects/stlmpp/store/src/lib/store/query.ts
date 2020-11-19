import { Store } from './store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, pluck } from 'rxjs/operators';
import { KeyValue } from '../type';
import { isString } from '@stlmpp/utils';

export class Query<T, E = any> {
  constructor(store: Store<T, E>) {
    this.__store = store;
    this.state$ = this.__store.selectState();
    this.loading$ = this.__store.selectLoading();
    this.error$ = this.__store.selectError();
    this.hasCache$ = this.__store.selectCache();
  }

  /** @internal */
  protected __store: Store<T, E>;

  state$: Observable<T>;
  loading$: Observable<boolean>;
  error$: Observable<E | null>;
  hasCache$: Observable<boolean>;

  getState(): T {
    return this.__store.getState();
  }

  getError(): E | null {
    return this.__store.getError();
  }

  getLoading(): boolean {
    return this.__store.getLoading();
  }

  getHasCache(): boolean {
    return this.__store.hasCache();
  }

  select(): Observable<T>;
  select<K extends keyof T>(key: K): Observable<T[K]>;
  select<R>(callback: (state: T) => R): Observable<R>;
  select<K extends keyof T, R>(callbackOrKey?: K | ((state: T) => R)): Observable<T | R | T[K]> {
    let state$: Observable<any> = this.state$;
    if (callbackOrKey) {
      const isKey = (key: any): key is keyof T => isString(key);
      if (isKey(callbackOrKey)) {
        state$ = state$.pipe(pluck(callbackOrKey));
      } else {
        state$ = state$.pipe(map(callbackOrKey));
      }
    }
    return state$.pipe(distinctUntilChanged());
  }

  selectAsKeyValue(pick?: (keyof T)[]): Observable<KeyValue<string | number, T[keyof T]>[]> {
    let state$ = this.state$;
    if (pick?.length) {
      state$ = state$.pipe(distinctUntilChanged((a, b) => pick.every(key => a[key] === b[key])));
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
