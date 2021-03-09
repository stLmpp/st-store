import { EntityStore } from './entity-store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { isArray, isFunction, isSet } from 'st-utils';
import {
  DistinctUntilChangedFn,
  EntityFilterOptions,
  EntityIdType,
  EntityPredicate,
  EntityState,
  EntityType,
  Entries,
} from '../type';
import { Query } from '../store/query';
import { StMap, StMapView } from '../map';

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

export class EntityQuery<
  State extends EntityState<T>,
  E = any,
  T extends Record<any, any> = EntityType<State>
> extends Query<State, E> {
  constructor(
    store: EntityStore<State, E, T>,
    private _distinctUntilChangedFn: DistinctUntilChangedFn<T | undefined> = isEqualEntity
  ) {
    super(store, { distinctUntilChanged: false });
  }

  private readonly _entities$ = this.select('entities');

  private get _state(): EntityState<T> {
    return this._store.getState();
  }

  private get _entities(): StMap<T> {
    return this._state.entities;
  }

  private _activeKeys$ = this.select('activeKeys');

  all$: Observable<StMapView<T>> = this._entities$.pipe(map(entities => entities.toView()));
  activeIds$: Observable<Set<EntityIdType>> = this._activeKeys$;
  active$: Observable<StMapView<T>> = this.activeIds$.pipe(switchMap(ids => this.selectMany(ids)));
  hasActive$: Observable<boolean> = this._activeKeys$.pipe(map(activeKeys => !!activeKeys.size));

  trackBy = this._entities.trackBy;

  getAll(): StMapView<T> {
    return this._entities.toView();
  }

  getActive(): StMapView<T> {
    const activeKeys = this._state.activeKeys;
    return this.getAll().filter((_, key) => activeKeys.has(key));
  }

  exists(idOrIdsOrCallback: Set<EntityIdType> | EntityIdType | EntityIdType[] | EntityPredicate<T>): boolean {
    const entities = this._entities;
    if (isFunction(idOrIdsOrCallback)) {
      return entities.some(idOrIdsOrCallback);
    } else if (isArray(idOrIdsOrCallback) || isSet(idOrIdsOrCallback)) {
      return [...idOrIdsOrCallback].some(id => entities.has(id));
    } else {
      return entities.has(idOrIdsOrCallback);
    }
  }

  hasActive(): boolean {
    return !!this._state.activeKeys.size;
  }

  selectEntity(id: EntityIdType): Observable<T | undefined>;
  selectEntity(callback: EntityPredicate<T>): Observable<T | undefined>;
  selectEntity<KEY extends keyof T>(
    idOrCallback: EntityIdType | EntityPredicate<T>,
    property: KEY
  ): Observable<T[KEY] | undefined>;
  selectEntity<KEY extends keyof T>(
    idOrCallback: EntityIdType | EntityPredicate<T>,
    property?: KEY
  ): Observable<T | T[KEY] | undefined> {
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

  getEntity(key: EntityIdType): T | undefined;
  getEntity<KEY extends keyof T>(key: EntityIdType, property: KEY): T[KEY] | undefined;
  getEntity<KEY extends keyof T>(key: EntityIdType, property?: KEY): T | T[KEY] | undefined {
    const entity = this._entities.get(key);
    return property ? entity?.[property] : entity;
  }

  selectMany(keysOrCallback: Set<EntityIdType> | EntityIdType[] | EntityPredicate<T>): Observable<StMapView<T>> {
    let callback: EntityPredicate<T>;
    if (isFunction(keysOrCallback)) {
      callback = keysOrCallback;
    } else {
      const keysSet = new Set(keysOrCallback);
      callback = (_: T, key: EntityIdType) => keysSet.has(key);
    }
    return this.all$.pipe(map(entities => entities.filter(callback)));
  }

  selectAll(options?: EntityFilterOptions<T>): Observable<StMapView<T>> {
    let all$ = this.all$;
    if (!options) {
      return all$;
    }
    const { filterBy, orderBy, orderByDirection } = options;
    if (filterBy) {
      const predicate = isFunction(filterBy)
        ? filterBy
        : (entity: T) => {
            const [key, value] = filterBy;
            return entity[key] === value;
          };
      all$ = all$.pipe(map(entities => entities.filter(predicate)));
    }
    if (orderBy) {
      all$ = all$.pipe(map(entities => entities.orderBy(orderBy, orderByDirection)));
    }
    return all$;
  }
}
