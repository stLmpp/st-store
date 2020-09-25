import { EntityStore } from './entity-store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, pluck } from 'rxjs/operators';
import { isArray, isEqual, isFunction, isString } from 'lodash-es';
import { ID } from '@stlmpp/utils';
import { EntityState, EntityType, ErrorType, IdType } from '../type';

export class EntityQuery<
  State extends EntityState,
  T = EntityType<State>,
  S extends ID = IdType<State>,
  E = ErrorType<State>
> {
  constructor(private __store: EntityStore<State, T, S, E>) {}

  private __state$ = this.__store.selectState();
  private __entities$ = this.__state$.pipe(pluck('entities'));
  private get __entities(): State['entities'] {
    return this.__store.getState().entities;
  }
  private get __keys(): Set<S> {
    return this.__entities.keys as Set<S>;
  }
  private get __active(): State['active'] {
    return this.__store.getState().active;
  }
  private get __state(): State {
    return this.__store.getState();
  }

  all$: Observable<T[]> = this.__entities$.pipe(map(entities => entities.values));
  active$: Observable<T[]> = this.select('active').pipe(
    map(active => active.values),
    distinctUntilChanged(isEqual)
  );

  activeId$: Observable<S[]> = this.select('active').pipe(
    map(active => active.keysArray),
    distinctUntilChanged(isEqual)
  );

  loading$: Observable<boolean> = this.select('loading');
  error$: Observable<E | null> = this.select('error');
  hasCache$ = this.__store.selectCache();

  getAll(): T[] {
    return this.__entities.values;
  }

  getActive(): T[] {
    return this.__active.values;
  }

  getLoading(): boolean {
    return this.__state.loading;
  }

  getError(): E | null {
    return this.__state.error;
  }

  getHasCache(): boolean {
    return this.__store.hasCache();
  }

  exists(id: S): boolean;
  exists(ids: S[]): boolean;
  exists(callback: (entity: T, key: S) => boolean): boolean;
  exists(idOrIdsOrCallback: S | S[] | ((entity: T, key: S) => boolean)): boolean {
    const entities = this.__entities;
    if (isFunction(idOrIdsOrCallback)) {
      return entities.some(idOrIdsOrCallback as any);
    } else if (isArray(idOrIdsOrCallback)) {
      return idOrIdsOrCallback.some(id => entities.has(id));
    } else {
      return entities.has(idOrIdsOrCallback);
    }
  }

  hasActive(): boolean {
    return !!this.__active.length;
  }

  select(): Observable<State>;
  select<K extends keyof State>(key: K): Observable<State[K]>;
  select<R>(callback: (state: State) => R): Observable<R>;
  select<K extends keyof State, R>(callbackOrKey?: K | ((state: State) => R)): Observable<State | R | State[K]> {
    let state$: Observable<EntityState<T, S, E> | State | State[K] | R> = this.__state$;
    if (callbackOrKey) {
      if (isString(callbackOrKey)) {
        state$ = state$.pipe(pluck(callbackOrKey));
      } else if (isFunction(callbackOrKey)) {
        state$ = state$.pipe(map(callbackOrKey as any));
      }
    }
    return state$.pipe(distinctUntilChanged(isEqual));
  }

  selectEntity(id: S): Observable<T>;
  selectEntity(callback: (entity: T, key: S) => boolean): Observable<T | undefined>;
  selectEntity<K extends keyof T>(idOrCallback: S | ((entity: T, key: S) => boolean), property: K): Observable<T[K]>;
  selectEntity<K extends keyof T>(
    idOrCallback: S | ((entity: T, key: S) => boolean),
    property?: K
  ): Observable<T | T[K] | undefined> {
    let entity$: Observable<T | T[K] | undefined>;
    if (isFunction(idOrCallback)) {
      entity$ = this.__entities$.pipe(map(entities => entities.find(idOrCallback as any)));
    } else {
      entity$ = this.__entities$.pipe(map(entities => entities.get(idOrCallback)));
    }
    if (property) {
      entity$ = entity$.pipe(pluck(property as string));
    }
    return entity$.pipe(distinctUntilChanged(isEqual));
  }

  getEntity(key: S): T | undefined;
  getEntity<K extends keyof T>(key: S, property: K): T[K] | undefined;
  getEntity<K extends keyof T>(key: S, property?: K): T | T[K] | undefined {
    const entity = this.__entities.get(key);
    return property ? entity?.[property] : entity;
  }

  selectMany(callback: (entity: T, key: S) => boolean): Observable<T[]>;
  selectMany(keys: S[]): Observable<T[]>;
  selectMany(keysOrCallback: S[] | ((entity: T, key: S) => boolean)): Observable<T[]> {
    const callback = isFunction(keysOrCallback) ? keysOrCallback : (_: T, key: S) => keysOrCallback.includes(key);
    return this.__entities$.pipe(
      map(entities => entities.filter(callback as any).values),
      distinctUntilChanged(isEqual)
    );
  }
}
