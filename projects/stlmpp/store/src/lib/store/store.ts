import { BehaviorSubject, Observable } from 'rxjs';
import { devCopy } from '../utils';
import { StoreOptions } from '../type';
import { isFunction, isNil } from 'lodash-es';
import { isID } from '@stlmpp/utils';
import { SetRequired } from 'type-fest';

export class Store<T, E = any> {
  constructor(__options: SetRequired<Partial<StoreOptions<T>>, 'initialState' | 'name'>) {
    this.__options = {
      ...({
        persistDeserialize: (value: any) => (isID(value) ? value : JSON.parse(value)),
        persistSerialize: (value: any) => (isID(value) ? value : JSON.stringify(value)),
      } as any),
      ...__options,
    };
    this.__state$ = new BehaviorSubject(this.__options.initialState);
    this.setPersist();
  }

  private __options: StoreOptions<T>;
  private __state$: BehaviorSubject<T>;
  private __error$ = new BehaviorSubject<E | null>(null);
  private __loading$ = new BehaviorSubject<boolean>(false);

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
    return '__ST_STORE__' + this.__options.name + '.' + this.__options.persist;
  }

  private setPersist(): void {
    if (this.__options.persist) {
      let state = this.getState();
      state = { ...state };
      let value = localStorage.getItem(this.getPersistKey());
      if (value) {
        value = this.__options.persistDeserialize(value);
        this.update({
          ...state,
          [this.__options.persist]: value,
        });
      }
    }
  }

  private persist(state: T): void {
    if (this.__options.persist) {
      const key = this.getPersistKey();
      const value = state[this.__options.persist];
      if (isNil(value)) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, this.__options.persistSerialize(value));
      }
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
