import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { devCopy } from '../utils';
import { StoreOptions } from '../type';
import { isFunction, isNil, set } from 'lodash-es';
import { copy } from 'copy-anything';
import { getDeep, isID, removeArray, updateArray, upsertArray } from '@stlmpp/utils';
import { Directive, OnDestroy } from '@angular/core';
import { takeUntil } from 'rxjs/operators';

@Directive()
// tslint:disable-next-line:directive-class-suffix
export class Store<T, E = any> implements OnDestroy {
  constructor(private __options?: StoreOptions<T>) {
    this.__options = {
      ...({
        persistDeserialize: value => (isID(value) ? value : JSON.parse(value)),
        persistSerialize: value => (isID(value) ? value : JSON.stringify(value)),
      } as any),
      ...__options,
    };
    this.__state$ = new BehaviorSubject(__options.initialState);
    if (this.__options.persist) {
      this.setPersist(copy(this.getState()));
    }
    this.listenToChildren();
  }

  type = 'simple';

  private _destroy$ = new Subject();

  private __state$: BehaviorSubject<T>;
  private __error$ = new BehaviorSubject<E>(null);
  private __loading$ = new BehaviorSubject<boolean>(false);

  private __timeout: any;
  private __cache$ = new BehaviorSubject(false);

  private _update$ = new Subject<T>();
  update$ = this._update$.asObservable();

  hasCache(): boolean {
    return this.__options.cache && this.__cache$.value;
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

  private getPersistKey(): string {
    return this.__options.name + '.' + this.__options.persist;
  }

  private setPersist(state: T): void {
    state = { ...state } ?? ({} as any);
    let value = localStorage.getItem(this.getPersistKey());
    if (value) {
      value = this.__options.persistDeserialize(value);
      set(state as any, this.__options.persist, value);
      this.update(state);
    }
  }

  private persist(state: T): void {
    if (this.__options.persist) {
      const key = this.getPersistKey();
      const value = getDeep(state, this.__options.persist);
      if (isNil(value)) {
        localStorage.removeItem(key);
      } else {
        localStorage.setItem(key, this.__options.persistSerialize(value));
      }
    }
  }

  set(state: T): void {
    this.persist(state);
    this._update$.next(state);
    this.__state$.next(devCopy(state));
  }

  update(partial: Partial<T>): void;
  update(state: T): void;
  update(callback: (state: T) => T): void;
  update(state: T | Partial<T> | ((state: T) => T)): void {
    const currentState = this.getState();
    const callback = isFunction(state) ? state : s => ({ ...s, ...state });
    const newState = this.preUpdate(callback(currentState));
    this.set(newState);
    this.postUpdate();
  }

  private listenToChildren(): void {
    if (this.__options.children?.length) {
      for (const { store: _store, key, isArray: _isArray } of this.__options.children) {
        if (_store.type === 'entity') {
          const store = _store as any;
          const _upsert = newEntity => {
            this.update(state => {
              return {
                ...state,
                [key]: _isArray
                  ? upsertArray(state?.[key as string] ?? [], newEntity, store.idGetter)
                  : { ...state?.[key], ...newEntity },
              };
            });
          };
          store.upsert$.pipe(takeUntil(this._destroy$)).subscribe(newEntity => _upsert(newEntity));
          store.add$.pipe(takeUntil(this._destroy$)).subscribe(newEntity => _upsert(newEntity));
          store.update$.pipe(takeUntil(this._destroy$)).subscribe(newEntity => {
            this.update(state => {
              return {
                ...state,
                [key]: _isArray
                  ? updateArray(
                      state[key as string] ?? [],
                      store.idGetter(newEntity),
                      newEntity,
                      store.idGetter
                    )
                  : { ...state[key], ...newEntity },
              };
            });
          });
          store.remove$.pipe(takeUntil(this._destroy$)).subscribe(removedEntities => {
            this.update(state => {
              return {
                ...state,
                [key]: _isArray
                  ? removeArray(
                      state[key as string] ?? [],
                      removedEntities.map(store.idGetter),
                      store.idGetter
                    )
                  : null,
              };
            });
          });
        } else if (_store.type === 'simple') {
          const store = _store as any;
          store.update$.pipe(takeUntil(this._destroy$)).subscribe(newEntity => {
            this.update({ [key]: newEntity } as any);
          });
        }
      }
    }
  }

  reset(): void {
    this.__state$.next(this.__options.initialState);
  }

  preUpdate(newState: T): T {
    return newState;
  }

  postUpdate(): void {}

  destroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.reset();
  }

  ngOnDestroy(): void {
    this.destroy();
  }
}
