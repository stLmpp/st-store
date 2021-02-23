import { BehaviorSubject, Observable } from 'rxjs';
import { devCopy } from '../util';
import { StoreOptions } from '../type';
import { isFunction } from 'st-utils';
import { StorePersistStrategy, StorePersistLocalStorageStrategy } from './store-persist';

export class Store<T, E = any> {
  constructor(private _options: StoreOptions<T>) {
    this._persist = this._options.persistStrategy ?? new StorePersistLocalStorageStrategy();
    this._state$ = new BehaviorSubject(this._mergePersistedValue(this._options.initialState));
  }

  private _state$: BehaviorSubject<T>;
  private _error$ = new BehaviorSubject<E | null>(null);
  private _loading$ = new BehaviorSubject<boolean>(false);
  private _persist: StorePersistStrategy<T>;

  private _timeout: any;
  private _cache$ = new BehaviorSubject(false);

  /** @internal */
  protected _useDevCopy = true;

  private _getPersistKey(): string {
    return '__ST_STORE__' + this._options.name + '.' + (this._options.persistKey ?? '');
  }

  private _mergePersistedValue(state: T): T {
    if (this._options.persistStrategy) {
      const key = this._getPersistKey();
      let value = this._persist.get(key);
      if (value) {
        value = this._persist.deserialize(value);
        return this._persist.setStore(state, value, this._options.persistKey);
      }
    }
    return state;
  }

  private _setPersist(state: T): void {
    if (this._options.persistStrategy) {
      const key = this._getPersistKey();
      const value = this._persist.getStore(state, this._options.persistKey);
      this._persist.set(key, this._persist.serialize(value));
    }
  }

  protected updateInitialState(initialState: T): void {
    this._options = { ...this._options, initialState };
  }

  hasCache(): boolean {
    return !!this._options.cache && this._cache$.value;
  }

  setHasCache(hasCache: boolean): void {
    if (this._options.cache) {
      clearTimeout(this._timeout);
      this._cache$.next(hasCache);
      if (hasCache) {
        this._timeout = setTimeout(() => {
          this.setHasCache(false);
        }, this._options.cache);
      }
    }
  }

  selectCache(): Observable<boolean> {
    return this._cache$.asObservable();
  }

  selectState(): Observable<T> {
    return this._state$.asObservable();
  }

  selectError(): Observable<E | null> {
    return this._error$.asObservable();
  }

  selectLoading(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  getState(): T {
    return this._state$.value;
  }

  getError(): E | null {
    return this._error$.value;
  }

  getLoading(): boolean {
    return this._loading$.value;
  }

  setLoading(loading: boolean): void {
    this._loading$.next(loading);
  }

  setError(error: E | null): void {
    this._error$.next(error);
  }

  set(state: T): void {
    this._setPersist(state);
    if (this._useDevCopy) {
      state = devCopy(state);
    }
    this._state$.next(state);
  }

  update(state: T | Partial<T> | ((oldState: T) => T)): void {
    const currentState = this.getState();
    const callback = isFunction(state) ? state : (oldState: T) => ({ ...oldState, ...state });
    const newState = this.preUpdate(callback(currentState));
    this.set(newState);
    this.postUpdate();
  }

  reset(): void {
    this._state$.next(this._options.initialState);
  }

  preUpdate(newState: T): T {
    return newState;
  }

  postUpdate(): void {}
}
