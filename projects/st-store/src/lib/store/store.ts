import { BehaviorSubject, Observable } from 'rxjs';
import { deepMerge, devCopy } from '../utils';
import { DeepPartial } from '../type';
import { isFunction } from 'is-what';

export class Store<T, E = any> {
  constructor(private initialState?: T, private cache?: number) {
    this.__state$ = new BehaviorSubject(initialState);
  }

  private __state$: BehaviorSubject<T>;
  private __error$ = new BehaviorSubject<E>(null);
  private __loading$ = new BehaviorSubject<boolean>(false);

  private __timeout: any;
  private __cache$ = new BehaviorSubject(false);

  hasCache(): boolean {
    return this.cache && this.__cache$.value;
  }

  setHasCache(hasCache: boolean): void {
    if (this.cache) {
      clearTimeout(this.__timeout);
      this.__cache$.next(hasCache);
      this.__timeout = setTimeout(() => {
        this.setHasCache(false);
      }, this.cache);
    }
  }

  selectCache(): Observable<boolean> {
    return this.__cache$.asObservable();
  }

  selectState(): Observable<T> {
    return this.__state$.asObservable();
  }

  selectError(): Observable<E> {
    return this.__error$.asObservable();
  }

  selectLoading(): Observable<boolean> {
    return this.__loading$.asObservable();
  }

  getState(): T {
    return this.__state$.value;
  }

  getError(): E {
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

  set(state: T): void {
    this.__state$.next(devCopy(state));
  }

  update(deepPartial: DeepPartial<T>): void;
  update(partial: Partial<T>): void;
  update(state: T): void;
  update(callback: (state: T) => T): void;
  update(state: T | Partial<T> | DeepPartial<T> | ((state: T) => T)): void {
    const currentState = this.getState();
    const callback = isFunction(state) ? state : s => deepMerge(s, state);
    const newState = this.preUpdate(callback(currentState));
    this.set(newState);
  }

  reset(): void {
    this.__state$.next(this.initialState);
  }

  preUpdate(newState: T): T {
    return newState;
  }

  postUpdate(): void {}
}
