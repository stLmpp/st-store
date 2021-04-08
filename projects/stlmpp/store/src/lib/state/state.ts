import { StateConfig } from '../type';
import { BehaviorSubject, Observable, queueScheduler, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, observeOn, pluck, takeUntil } from 'rxjs/operators';
import { isArray, isFunction, isObject } from 'st-utils';
import { devCopy } from '../util';
import { distinctUntilKeysChanged } from '../operators/distinct-until-keys-changed';
import { StateService } from './state.service';

export class State<T extends Record<string, any> = Record<string, any>> {
  constructor(initialState: T, config: StateConfig = {}, private stateService?: StateService) {
    this.name = config.name;
    this._state$ = new BehaviorSubject(initialState);
    this._updateQueue$
      .pipe(
        observeOn(config.scheduler ?? queueScheduler),
        takeUntil(this.destroy$),
        filter(updates => !!updates.length)
      )
      .subscribe(updates => {
        const state = devCopy(this._state$.value);
        const newState = updates.reduce((acc, item) => item(acc), state);
        this._state$.next(newState);
        this._updateQueue$.next([]);
      });
  }

  private readonly _updateQueue$ = new BehaviorSubject<((state: T) => T)[]>([]);

  protected readonly _state$: BehaviorSubject<T>;
  readonly destroy$ = new Subject();
  readonly name?: string;

  private _updateQueue(callback: (state: T) => T): void {
    this._updateQueue$.next([...this._updateQueue$.value, callback]);
  }

  setState(state: T): void {
    this._updateQueue(() => state);
  }

  updateState<K extends keyof T>(
    keyOrPartialOrCallback: K | Partial<T> | ((state: T) => T),
    partialOrCallback?: T[K] | ((state: T[K]) => T[K])
  ): void {
    if (isFunction(keyOrPartialOrCallback) || isObject(keyOrPartialOrCallback)) {
      const callback = isFunction(keyOrPartialOrCallback)
        ? keyOrPartialOrCallback
        : (state: T) => ({ ...state, ...keyOrPartialOrCallback });
      this._updateQueue(callback);
    } else {
      const callback = isFunction(partialOrCallback) ? partialOrCallback : () => partialOrCallback;
      this._updateQueue(state => ({ ...state, [keyOrPartialOrCallback]: callback(state[keyOrPartialOrCallback]) }));
    }
  }

  selectState(): Observable<T>;
  selectState<K extends keyof T>(key: K): Observable<T[K]>;
  selectState<K extends keyof T>(keys: K[]): Observable<Pick<T, K>>;
  selectState<K extends keyof T>(keyOrKeys?: K | K[]): Observable<T[K] | T | Pick<T, K>> {
    let state$: Observable<T[K] | T | Pick<T, K>> = this._state$.asObservable();
    if (isArray(keyOrKeys)) {
      state$ = state$.pipe(
        distinctUntilKeysChanged(keyOrKeys),
        map(state => keyOrKeys.reduce((acc, key) => ({ ...acc, [key]: state[key] }), {} as Pick<T, K>))
      );
    } else if (keyOrKeys) {
      state$ = state$.pipe(pluck(keyOrKeys), distinctUntilChanged());
    }
    return state$;
  }

  getState(): T;
  getState<K extends keyof T>(key: K): T[K];
  getState<K extends keyof T>(key?: K): T | T[K] {
    return key ? this._state$.value[key] : this._state$.value;
  }

  destroy(): void {
    if (this.stateService) {
      this.stateService.destroy(this);
    } else {
      this.destroyInternal();
    }
  }

  /** @internal */
  destroyInternal(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this._state$.complete();
    this._updateQueue$.complete();
  }
}
