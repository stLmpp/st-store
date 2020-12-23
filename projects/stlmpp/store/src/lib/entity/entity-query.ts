import { EntityStore } from './entity-store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { ID, isArray, isFunction, orderByOperator } from '@stlmpp/utils';
import {
  DistinctUntilChangedFn,
  EntityFilterOptions,
  EntityState,
  EntityType,
  Entries,
  ErrorType,
  IdType,
} from '../type';
import { distinctUntilManyChanged } from '../util';
import { Query } from '../store/query';

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
> extends Query<State> {
  constructor(
    store: EntityStore<State, T, S, E>,
    private _distinctUntilChangedFn: DistinctUntilChangedFn<T | undefined> = isEqualEntity
  ) {
    super(store);
    this._distinctUntilManyChangedFn = isEqualEntitiesFactory(_distinctUntilChangedFn);
  }

  private readonly _distinctUntilManyChangedFn: DistinctUntilChangedFn<T[]>;
  private readonly _entities$ = this.select('entities');

  private get _state(): EntityState<T, S, E> {
    return this._store.getState();
  }

  private get _entities(): State['entities'] {
    return this._state.entities;
  }

  all$: Observable<T[]> = this._entities$.pipe(map(entities => entities.values));

  activeIds$: Observable<S[]> = this.select('activeKeys').pipe(
    map(active => [...active]),
    distinctUntilManyChanged()
  );

  active$: Observable<T[]> = this.activeIds$.pipe(switchMap(ids => this.selectMany(ids)));

  hasActive$: Observable<boolean> = this.select('activeKeys').pipe(map(activeKeys => !!activeKeys.size));

  getAll(): T[] {
    return this._entities.values;
  }

  getActive(): T[] {
    const activeKeys = this._state.activeKeys;
    return this._entities.filter((_, key) => activeKeys.has(key)).values;
  }

  exists(id: S): boolean;
  exists(ids: S[]): boolean;
  exists(callback: (entity: T, key: S) => boolean): boolean;
  exists(idOrIdsOrCallback: S | S[] | ((entity: T, key: S) => boolean)): boolean {
    const entities = this._entities;
    if (isFunction(idOrIdsOrCallback)) {
      return entities.some(idOrIdsOrCallback);
    } else if (isArray(idOrIdsOrCallback)) {
      return idOrIdsOrCallback.some(id => entities.has(id));
    } else {
      return entities.has(idOrIdsOrCallback);
    }
  }

  hasActive(): boolean {
    return !!this._state.activeKeys.size;
  }

  selectEntity(id: S): Observable<T | undefined>;
  selectEntity(callback: (entity: T, key: S) => boolean): Observable<T | undefined>;
  selectEntity<K extends keyof T>(
    idOrCallback: S | ((entity: T, key: S) => boolean),
    property: K
  ): Observable<T[K] | undefined>;
  selectEntity<K extends keyof T>(
    idOrCallback: S | ((entity: T, key: S) => boolean),
    property?: K
  ): Observable<T | T[K] | undefined> {
    let entity$: Observable<T | undefined>;
    if (isFunction(idOrCallback)) {
      entity$ = this._entities$.pipe(map(entities => entities.find(idOrCallback)));
    } else {
      entity$ = this._entities$.pipe(map(entities => entities.get(idOrCallback)));
    }
    if (property) {
      return entity$.pipe(
        map(entity => entity?.[property]),
        distinctUntilChanged()
      );
    }
    return entity$.pipe(distinctUntilChanged(this._distinctUntilChangedFn));
  }

  getEntity(key: S): T | undefined;
  getEntity<K extends keyof T>(key: S, property: K): T[K] | undefined;
  getEntity<K extends keyof T>(key: S, property?: K): T | T[K] | undefined {
    const entity = this._entities.get(key);
    return property ? entity?.[property] : entity;
  }

  selectMany(callback: (entity: T, key: S) => boolean): Observable<T[]>;
  selectMany(keys: S[]): Observable<T[]>;
  selectMany(keysOrCallback: S[] | ((entity: T, key: S) => boolean)): Observable<T[]> {
    const callback = isFunction(keysOrCallback) ? keysOrCallback : (_: T, key: S) => keysOrCallback.includes(key);
    return this._entities$.pipe(
      map(entities => entities.filter(callback).values),
      distinctUntilChanged(this._distinctUntilManyChangedFn)
    );
  }

  selectAll(): Observable<T[]>;
  selectAll(options: EntityFilterOptions<T, S, E>): Observable<T[]>;
  selectAll(options?: EntityFilterOptions<T, S, E>): Observable<T[]> {
    let entities$ = this._entities$;
    if (!options) {
      return this.all$;
    }
    const { filterBy, limit, orderBy, orderByDirection } = options;
    if (filterBy) {
      const predicate = isFunction(filterBy)
        ? filterBy
        : (entity: T) => {
            const [key, value] = filterBy;
            return entity[key] === value;
          };
      entities$ = entities$.pipe(map(entities => entities.filter(predicate)));
    }
    let all$ = entities$.pipe(map(entities => entities.values));
    if (limit && limit > 0) {
      all$ = all$.pipe(map(entities => entities.slice(0, limit)));
    }
    if (orderBy) {
      all$ = all$.pipe(orderByOperator(orderBy as any, orderByDirection));
    }
    return all$;
  }
}
