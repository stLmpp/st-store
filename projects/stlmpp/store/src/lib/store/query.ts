import { Store } from './store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, pluck } from 'rxjs/operators';
import { Entries, KeyValue, QueryOptions } from '../type';
import { isFunction } from 'st-utils';

export class Query<T extends Record<any, any>, E = any> {
  /**
   * @template T
   * @param {Store<T, E>} store the store that the query will be based on
   * @param {QueryOptions} options optional options
   */
  constructor(store: Store<T, E>, options?: QueryOptions) {
    this._options = { distinctUntilChanged: true, ...options };
    this._store = store;
    this.state$ = this._store.selectState();
    this.loading$ = this._store.selectLoading();
    this.error$ = this._store.selectError();
    this.hasCache$ = this._store.selectCache();
  }

  /** @internal */
  protected readonly _store: Store<T, E>;

  protected readonly _options: QueryOptions;

  /**
   * @description observable with the full state
   * @type {Observable<T>}
   */
  readonly state$: Observable<T>;
  /**
   * @description observable with the loading state
   * @type {Observable<boolean>}
   */
  readonly loading$: Observable<boolean>;
  /**
   * @description observable with the error state
   * @type {Observable<E | null>}
   */
  readonly error$: Observable<E | null>;
  /**
   * @description observable with the hasCache state
   * @type {Observable<boolean>}
   */
  readonly hasCache$: Observable<boolean>;

  /**
   * @description returns a snapshot of the state
   * @returns {T}
   */
  getState(): T {
    return this._store.getState();
  }

  /**
   * @description returns a snapshot of the error
   * @returns {E | null}
   */
  getError(): E | null {
    return this._store.getError();
  }

  /**
   * @description returns a snapshot of the loading state
   * @returns {boolean}
   */
  getLoading(): boolean {
    return this._store.getLoading();
  }

  /**
   * @description returns a snapshot of the hasCache state
   * @returns {boolean}
   */
  getHasCache(): boolean {
    return this._store.hasCache();
  }

  /**
   * @description returns an observable of the state. Same as {@link Query#state$}
   * @returns {Observable<T>}
   */
  select(): Observable<T>;
  /**
   * @description returns an observable of an property of the state.
   * @param {K} key
   * @returns {Observable<T[K]>}
   */
  select<K extends keyof T>(key: K): Observable<T[K]>;
  /**
   * @description returns an observable of the state based on a predicate
   * @param {(state: T) => R} callback
   * @returns {Observable<R>}
   */
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

  /**
   * @description returns an observable of the state as {@link KeyValue} based on the keys
   * @param {K[]} pick
   * @returns {Observable<KeyValue<K, T[K]>[]>}
   */
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
