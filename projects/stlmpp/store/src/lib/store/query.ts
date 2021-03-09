import { Store } from './store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, pluck } from 'rxjs/operators';
import { Entries, KeyValue, QueryOptions } from '../type';
import { isFunction } from 'st-utils';

export class Query<T extends Record<any, any>, E = any> {
  constructor(store: Store<T, E>, options?: QueryOptions) {
    this._options = { distinctUntilChanged: true, ...options };
    this._store = store;
    this.state$ = this._store.selectState();
    this.loading$ = this._store.selectLoading();
    this.error$ = this._store.selectError();
    this.hasCache$ = this._store.selectCache();
  }

  /** @internal */
  protected _store: Store<T, E>;

  protected _options: QueryOptions;

  state$: Observable<T>;
  loading$: Observable<boolean>;
  error$: Observable<E | null>;
  hasCache$: Observable<boolean>;

  getState(): T {
    return this._store.getState();
  }

  getError(): E | null {
    return this._store.getError();
  }

  getLoading(): boolean {
    return this._store.getLoading();
  }

  getHasCache(): boolean {
    return this._store.hasCache();
  }

  select(): Observable<T>;
  select<K extends keyof T>(key: K): Observable<T[K]>;
  select<R>(callback: (state: T) => R): Observable<R>;
  select<K extends keyof T, R>(callbackOrKey?: K | ((state: T) => R)): Observable<T | R | T[K]> {
    let state$: Observable<any> = this.state$;
    if (callbackOrKey) {
      if (isFunction(callbackOrKey)) {
        state$ = state$.pipe(map(callbackOrKey));
      } else {
        state$ = state$.pipe(pluck(callbackOrKey));
      }
    }
    if (this._options.distinctUntilChanged) {
      state$ = state$.pipe(distinctUntilChanged());
    }
    return state$;
  }

  selectAsKeyValue<K extends keyof T>(pick?: K[]): Observable<KeyValue<K, T[K]>[]> {
    let state$ = this.state$;
    if (pick?.length && this._options.distinctUntilChanged) {
      state$ = state$.pipe(distinctUntilChanged((stateA, stateB) => pick.every(key => stateA[key] === stateB[key])));
    }
    return state$.pipe(
      map(state => {
        let entries = Object.entries(state) as Entries<T, K>;
        if (pick?.length) {
          const keysSet = new Set(pick);
          entries = entries.filter(([key]) => keysSet.has(key));
        }
        return entries.map(([key, value]) => ({ key, value }));
      })
    );
  }
}
