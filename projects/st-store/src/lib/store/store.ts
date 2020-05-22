import { BehaviorSubject, Observable } from 'rxjs';
import { deepMerge, devCopy } from '../utils';
import { DeepPartial } from '../type';
import { isFunction } from 'is-what';

export class Store<T, E = any> {
  constructor(private initialState?: T) {
    this.state$ = new BehaviorSubject(initialState);
  }

  private state$: BehaviorSubject<T>;
  private error$ = new BehaviorSubject<E>(null);
  private loading$ = new BehaviorSubject<boolean>(false);

  selectState(): Observable<T> {
    return this.state$.asObservable();
  }

  selectError(): Observable<E> {
    return this.error$.asObservable();
  }

  selectLoading(): Observable<boolean> {
    return this.loading$.asObservable();
  }

  getState(): T {
    return this.state$.value;
  }

  getError(): E {
    return this.error$.value;
  }

  getLoading(): boolean {
    return this.loading$.value;
  }

  setLoading(loading: boolean): void {
    this.loading$.next(loading);
  }

  setError(error: E): void {
    this.error$.next(error);
  }

  set(state: T): void {
    this.state$.next(devCopy(state));
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
    this.state$.next(this.initialState);
  }

  preUpdate(newState: T): T {
    return newState;
  }

  postUpdate(): void {}
}
