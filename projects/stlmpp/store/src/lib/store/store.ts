import { BehaviorSubject, Observable } from 'rxjs';
import { devCopy } from '../util';
import { StoreOptions } from '../type';
import { isFunction } from 'st-utils';
import { StorePersistLocalStorageStrategy, StorePersistStrategy } from './store-persist';
import { State } from '../state/state';

export function getPersistKey<T extends Record<any, any>>(name: string, persist: keyof T): string {
  return '__ST_STORE__' + name + '.' + (persist ?? '');
}

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

  private _setPersist(state: T): void {
    if (this._options.persistStrategy) {
      const key = getPersistKey(this._options.name, this._options.persistKey);
      const value = this._persistStrategy.getStore(state, this._options.persistKey);
      this._persistStrategy.set(key, this._persistStrategy.serialize(value));
    }
  }

  /** @internal */
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

  selectError(): Observable<E | null> {
    return this._error$.asObservable();
  }

  selectLoading(): Observable<boolean> {
    return this._loading$.asObservable();
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

  setState(state: T): void {
    if (this._useDevCopy) {
      state = devCopy(state);
    }
    this._setPersist(state);
    super.setState(state);
  }

  updateState(state: T | Partial<T> | ((oldState: T) => T)): void {
    const currentState = this.getState();
    const callback = isFunction(state) ? state : (oldState: T) => ({ ...oldState, ...state });
    const newState = this.preUpdate(callback(currentState));
    this.setState(newState);
    this.postUpdate();
  }

  reset(): void {
    this.setState(this._options.initialState);
  }

  preUpdate(newState: T): T {
    return newState;
  }

  postUpdate(): void {}

  ngOnDestroy(): void {
    this.destroy();
  }
}
