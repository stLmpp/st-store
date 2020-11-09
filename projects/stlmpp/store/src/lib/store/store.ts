import { BehaviorSubject, Observable } from 'rxjs';
import { devCopy } from '../util';
import { StoreOptions } from '../type';
import { isFunction } from '@stlmpp/utils';
import { StorePersistStrategy, StorePersistLocalStorageStrategy } from './store-persist';

export class Store<T, E = any> {
  constructor(private __options: StoreOptions<T>) {
    this.__persist = this.__options.persistStrategy ?? new StorePersistLocalStorageStrategy();
    this.__state$ = new BehaviorSubject(this.setPersist(this.__options.initialState));
  }

  private __state$: BehaviorSubject<T>;
  private __error$ = new BehaviorSubject<E | null>(null);
  private __loading$ = new BehaviorSubject<boolean>(false);
  private __persist: StorePersistStrategy<T>;

  private __timeout: any;
  private __cache$ = new BehaviorSubject(false);

  hasCache(): boolean {
    return !!this.__options.cache && this.__cache$.value;
  }

  setHasCache(hasCache: boolean): void {
    if (this.__options.cache) {
      clearTimeout(this.__timeout);
      this.__cache$.next(hasCache);
      if (hasCache) {
        this.__timeout = setTimeout(() => {
          this.setHasCache(false);
        }, this.__options.cache);
      }
    }
  }

  selectCache(): Observable<boolean> {
    return this.__cache$.asObservable();
  }

  selectState(): Observable<T> {
    return this.__state$.asObservable();
  }

  selectError(): Observable<E | null> {
    return this.__error$.asObservable();
  }

  selectLoading(): Observable<boolean> {
    return this.__loading$.asObservable();
  }

  getState(): T {
    return this.__state$.value;
  }

  getError(): E | null {
    return this.__error$.value;
  }

  getLoading(): boolean {
    return this.__loading$.value;
  }

  setLoading(loading: boolean): void {
    this.__loading$.next(loading);
  }

  setError(error: E): void {
    this.__error$.next(error);
  }

  private getPersistKey(): string {
    return '__ST_STORE__' + this.__options.name + '.' + (this.__options.persistKey ?? '');
  }

  private setPersist(state: T): T {
    if (this.__options.persistStrategy) {
      const key = this.getPersistKey();
      let value = this.__persist.get(key);
      if (value) {
        value = this.__persist.deserialize(value);
        return this.__persist.setStore(state, value, this.__options.persistKey);
      }
    }
    return state;
  }

  private persist(state: T): void {
    if (this.__options.persistStrategy) {
      const key = this.getPersistKey();
      const value = this.__persist.getStore(state, this.__options.persistKey);
      this.__persist.set(key, this.__persist.serialize(value));
    }
  }

  set(state: T): void {
    this.persist(state);
    this.__state$.next(devCopy(state));
  }

  update(partial: Partial<T>): void;
  update(state: T): void;
  update(callback: (state: T) => T): void;
  update(state: T | Partial<T> | ((state: T) => T)): void {
    const currentState = this.getState();
    const callback = isFunction(state) ? state : (s: T) => ({ ...s, ...state });
    const newState = this.preUpdate(callback(currentState));
    this.set(newState);
    this.postUpdate();
  }

  reset(): void {
    this.__state$.next(this.__options.initialState);
  }

  preUpdate(newState: T): T {
    return newState;
  }

  postUpdate(): void {}
}
