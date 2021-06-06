import { BehaviorSubject, Observable } from 'rxjs';
import { devCopy } from '../util';
import { StoreOptions } from '../type';
import { isFunction } from 'st-utils';
import { StorePersistLocalStorageStrategy, StorePersistStrategy } from './store-persist';
import { State } from '../state/state';

/**
 * @description returns an key to persist
 * @param {string} name
 * @param {keyof T} persist
 * @returns {string}
 */
export function getPersistKey<T extends Record<any, any>>(name: string, persist: keyof T): string {
  return '__ST_STORE__' + name + '.' + (persist ?? '');
}

/**
 * @description merge the persisted value with the state
 * @param {keyof T | undefined} persistKey
 * @param {StorePersistStrategy<T> | undefined} persistStrategy
 * @param {string} name
 * @param {T} initialState
 * @returns {T}
 */
function mergePersistedValue<T extends Record<any, any>>({
  persistKey,
  persistStrategy = new StorePersistLocalStorageStrategy(),
  name,
  initialState,
}: StoreOptions<T>): T {
  const key = getPersistKey(name, persistKey);
  let value = persistStrategy.get(key);

  if (value) {
    value = persistStrategy.deserialize(value);
    return persistStrategy.setStore(initialState, value, persistKey);
  }
  return initialState;
}

export class Store<T extends Record<any, any>, E = any> extends State<T> {
  /**
   * @template T
   * @param {StoreOptions<T>} _options
   */
  constructor(private _options: StoreOptions<T>) {
    super(mergePersistedValue(_options), { name: _options.name });
    this._persistStrategy = this._options.persistStrategy ?? new StorePersistLocalStorageStrategy();
  }

  private readonly _error$ = new BehaviorSubject<E | null>(null);
  private readonly _loading$ = new BehaviorSubject<boolean>(false);
  private readonly _persistStrategy: StorePersistStrategy<T>;

  private _timeout: any;
  private readonly _cache$ = new BehaviorSubject(false);

  /** @internal */
  protected _useDevCopy = true;

  private _setPersist(state: T): this {
    if (this._options.persistStrategy) {
      const key = getPersistKey(this._options.name, this._options.persistKey);
      const value = this._persistStrategy.getStore(state, this._options.persistKey);
      this._persistStrategy.set(key, this._persistStrategy.serialize(value));
    }
    return this;
  }

  /** @internal */
  protected updateInitialState(initialState: T): this {
    this._options = { ...this._options, initialState };
    return this;
  }

  /**
   * @description returns if the store has cache
   * @returns {boolean}
   */
  hasCache(): boolean {
    return !!this._options.cache && this._cache$.value;
  }

  /**
   * @description manually set the cache in the store
   * @param {boolean} hasCache
   */
  setHasCache(hasCache: boolean): this {
    if (this._options.cache) {
      clearTimeout(this._timeout);
      this._cache$.next(hasCache);
      if (hasCache) {
        this._timeout = setTimeout(() => {
          this.setHasCache(false);
        }, this._options.cache);
      }
    }
    return this;
  }

  /**
   * @description returns an observable with the cache state
   * @returns {Observable<boolean>}
   */
  selectCache(): Observable<boolean> {
    return this._cache$.asObservable();
  }

  /**
   * @description returns an observable with the error state
   * @returns {Observable<E | null>}
   */
  selectError(): Observable<E | null> {
    return this._error$.asObservable();
  }

  /**
   * @description returns an observable of the loading state
   * @returns {Observable<boolean>}
   */
  selectLoading(): Observable<boolean> {
    return this._loading$.asObservable();
  }

  /**
   * @description returns a snapshot of the error state
   * @returns {E | null}
   */
  getError(): E | null {
    return this._error$.value;
  }

  /**
   * @description returns an snapshot of the loading state
   * @returns {boolean}
   */
  getLoading(): boolean {
    return this._loading$.value;
  }

  /**
   * @description set the loading state
   * @param {boolean} loading
   * @returns {this}
   */
  setLoading(loading: boolean): this {
    this._loading$.next(loading);
    return this;
  }

  /**
   * @description set the error state
   * @param {E | null} error
   * @returns {this}
   */
  setError(error: E | null): this {
    this._error$.next(error);
    return this;
  }

  /**
   * @description set the state with a new value
   * @param {T} state
   * @returns {this}
   */
  setState(state: T): this {
    if (this._useDevCopy) {
      state = devCopy(state);
    }
    this._setPersist(state);
    return super.setState(state);
  }

  /**
   * @description update/merge the state with a partial/full value
   * @param {Partial<T> | ((oldState: T) => T) | T} state
   * @returns {this}
   */
  updateState(state: T | Partial<T> | ((oldState: T) => T)): this {
    const currentState = this.getState();
    const callback = isFunction(state) ? state : (oldState: T) => ({ ...oldState, ...state });
    const newState = this.preUpdate(callback(currentState));
    return this.setState(newState).postUpdate();
  }

  /**
   * @description reset the state with its initial value
   * @returns {this}
   */
  reset(): this {
    return this.setState(this._options.initialState);
  }

  /**
   * @description middleware called before the update of the state
   * @param {T} newState
   * @returns {T}
   */
  preUpdate(newState: T): T {
    return newState;
  }

  /**
   * @description middleware called after the update in the state
   */
  postUpdate(): this {
    return this;
  }
}
