import { EntityStore } from './entity-store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, pluck, switchMap } from 'rxjs/operators';
import { isArray, isFunction, isString } from 'lodash-es';
import { ID } from '@stlmpp/utils';
import { DistinctUntilChangedFn, EntityState, EntityType, Entries, ErrorType, IdType } from '../type';
import { distinctUntilManyChanged } from '../util';

export function isEqualEntity<T = any>(entityA: T, entityB: T): boolean {
  if (entityA === entityB) {
    return true;
  }
  if ((!entityA && entityB) || (entityA && !entityB)) {
    return false;
  }
  const entriesA = Object.entries(entityA) as Entries<T>;
  const entriesB = Object.entries(entityB) as Entries<T>;
  if (entriesA.length !== entriesB.length) {
    return false;
  }
  for (const [key, value] of entriesA) {
    if (entityB[key] !== value) {
      return false;
    }
  }
  return true;
}

export function isEqualEntitiesFactory<T = any>(distinctFn: DistinctUntilChangedFn<T>): DistinctUntilChangedFn<T[]> {
  return (entitiesA, entitiesB) => {
    if (entitiesA === entitiesB) {
      return true;
    }
    if ((!entitiesA && entitiesB) || (entitiesA && !entitiesB) || entitiesA.length !== entitiesB.length) {
      return false;
    }
    let index = entitiesA.length;
    while (index--) {
      const entityA = entitiesA[index];
      const entityB = entitiesB[index];
      if (!distinctFn(entityA, entityB)) {
        return false;
      }
    }
    return true;
  };
}

export class EntityQuery<
  State extends EntityState<T, S, E>,
  T = EntityType<State>,
  S extends ID = IdType<State>,
  E = ErrorType<State>
> {
  constructor(
    private __store: EntityStore<State, T, S, E>,
    private __distinctUntilChangedFn: DistinctUntilChangedFn<T | undefined> = isEqualEntity
  ) {
    this.__distinctUntilManyChangedFn = isEqualEntitiesFactory(__distinctUntilChangedFn);
  }

  private readonly __distinctUntilManyChangedFn: DistinctUntilChangedFn<T[]>;
  private __state$ = this.__store.selectState();
  private __entities$ = this.__state$.pipe(pluck('entities'));
  private get __entities(): State['entities'] {
    return this.__store.getState().entities;
  }
  private get __keys(): Set<S> {
    return this.__entities.keys as Set<S>;
  }
  private get __state(): EntityState<T, S, E> {
    return this.__store.getState();
  }

  all$: Observable<T[]> = this.__entities$.pipe(map(entities => entities.values));

  activeId$: Observable<S[]> = this.select('activeKeys').pipe(
    map(active => [...active] as S[]),
    distinctUntilManyChanged()
  );

  active$: Observable<T[]> = this.activeId$.pipe(switchMap(ids => this.selectMany(ids)));

  loading$: Observable<boolean> = this.select('loading');
  error$: Observable<E | null> = this.select('error');
  hasCache$ = this.__store.selectCache();

  getAll(): T[] {
    return this.__entities.values;
  }

  getActive(): T[] {
    const activeKeys = this.__state.activeKeys;
    return this.__entities.filter((_, key) => activeKeys.has(key)).values;
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
      return entities.some(idOrIdsOrCallback);
    } else if (isArray(idOrIdsOrCallback)) {
      return idOrIdsOrCallback.some(id => entities.has(id));
    } else {
      return entities.has(idOrIdsOrCallback);
    }
  }

  hasActive(): boolean {
    return !!this.__state.activeKeys.size;
  }

  select(): Observable<State>;
  select<K extends keyof State>(key: K): Observable<State[K]>;
  select<R>(callback: (state: State) => R): Observable<R>;
  select<K extends keyof State, R>(callbackOrKey?: K | ((state: State) => R)): Observable<State | R | State[K]> {
    let state$: Observable<any> = this.__state$;
    if (callbackOrKey) {
      const isKey = (key: any): key is keyof State => isString(key);
      if (isKey(callbackOrKey)) {
        state$ = state$.pipe(pluck(callbackOrKey));
      } else {
        state$ = state$.pipe(map(callbackOrKey));
      }
    }
    return state$.pipe(distinctUntilChanged());
  }

  selectEntity(id: S): Observable<T>;
  selectEntity(callback: (entity: T, key: S) => boolean): Observable<T | undefined>;
  selectEntity<K extends keyof T>(idOrCallback: S | ((entity: T, key: S) => boolean), property: K): Observable<T[K]>;
  selectEntity<K extends keyof T>(
    idOrCallback: S | ((entity: T, key: S) => boolean),
    property?: K
  ): Observable<T | T[K] | undefined> {
    let entity$: Observable<T | undefined>;
    if (isFunction(idOrCallback)) {
      entity$ = this.__entities$.pipe(map(entities => entities.find(idOrCallback)));
    } else {
      entity$ = this.__entities$.pipe(map(entities => entities.get(idOrCallback)));
    }
    if (property) {
      return entity$.pipe(
        map(entity => entity?.[property]),
        distinctUntilChanged()
      );
    }
    return entity$.pipe(distinctUntilChanged(this.__distinctUntilChangedFn));
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
      map(entities => entities.filter(callback).values),
      distinctUntilChanged(this.__distinctUntilManyChangedFn)
    );
  }
}
