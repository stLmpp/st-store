import { StateConfig } from '../type';
import { BehaviorSubject, Observable, queueScheduler, Subject } from 'rxjs';
import { distinctUntilChanged, filter, map, observeOn, pluck, takeUntil } from 'rxjs/operators';
import { isArray, isFunction, isObject } from 'st-utils';
import { devCopy } from '../util';
import { distinctUntilKeysChanged } from '../operators/distinct-until-keys-changed';
import { StateService } from './state.service';

export class State<T extends Record<string, any> = Record<string, any>> {
  /**
   * @template T
   * @description creates a instace of state, to handle reactivity with observables (similar to react state)
   * @param {T} initialState
   * @param {StateConfig} config
   * @param {StateService} stateService optional parameter, only injected when create from {@link StateService#create}
   */
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
        const state = config.useDevCopy ? devCopy(this._state$.value) : this._state$.value;
        const newState = updates.reduce((acc, item) => item(acc), state);
        this._state$.next(newState);
        this._updateQueue$.next([]);
      });
  }

  private readonly _updateQueue$ = new BehaviorSubject<((state: T) => T)[]>([]);

  protected readonly _state$: BehaviorSubject<T>;
  readonly destroy$ = new Subject<void>();
  readonly name?: string;

  private _updateQueue(callback: (state: T) => T): this {
    this._updateQueue$.next([...this._updateQueue$.value, callback]);
    return this;
  }

  /**
   * @description set a new value to the state (replacing the previous state)
   * @param {T} state
   * @returns {this}
   */
  setState(state: T): this {
    return this._updateQueue(() => state);
  }

  /**
   * @description update the state with a partial/full value or callback function
   * @param {Partial<T> | ((state: T) => T) | K} keyOrPartialOrCallback
   * @param {T[K] | ((state: T[K]) => T[K])} partialOrCallback
   * @returns {this}
   */
  updateState<K extends keyof T>(
    keyOrPartialOrCallback: K | Partial<T> | ((state: T) => T),
    partialOrCallback?: T[K] | ((state: T[K]) => T[K])
  ): this {
    if (isFunction(keyOrPartialOrCallback) || isObject(keyOrPartialOrCallback)) {
      const callback = isFunction(keyOrPartialOrCallback)
        ? keyOrPartialOrCallback
        : (state: T) => ({ ...state, ...keyOrPartialOrCallback });
      this._updateQueue(callback);
    } else {
      const callback = isFunction(partialOrCallback) ? partialOrCallback : () => partialOrCallback;
      this._updateQueue(state => ({ ...state, [keyOrPartialOrCallback]: callback(state[keyOrPartialOrCallback]) }));
    }
    return this;
  }

  /**
   * @description returns an observable with the full state
   * @returns {Observable<T>}
   */
  selectState(): Observable<T>;
  /**
   * @description returns an observable with a property from the state
   * @param {K} key
   * @returns {Observable<T[K]>}
   */
  selectState<K extends keyof T>(key: K): Observable<T[K]>;
  /**
   * @description returns an observable with multiple properties based in the keys param
   * @param {K[]} keys
   * @returns {Observable<Pick<T, K>>}
   */
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

  /**
   * @description returns a snapshot of the state
   * @returns {T}
   */
  getState(): T;
  /**
   * @description returns a snpashot of a property of the state
   * @param {K} key
   * @returns {T[K]}
   */
  getState<K extends keyof T>(key: K): T[K];
  getState<K extends keyof T>(key?: K): T | T[K] {
    return key ? this._state$.value[key] : this._state$.value;
  }

  /**
   * @description destroy the state
   */
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
