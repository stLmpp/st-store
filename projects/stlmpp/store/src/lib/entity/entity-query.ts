import { EntityStore } from './entity-store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, switchMap } from 'rxjs/operators';
import { isArray, isFunction, isObjectEqualShallow, isSet } from 'st-utils';
import {
  DistinctUntilChangedFn,
  EntityFilterOptions,
  EntityIdType,
  EntityPredicate,
  EntityQueryOptions,
  EntityState,
  EntityType,
} from '../type';
import { Query } from '../store/query';
import { StMap, StMapView } from '../map';
import { TrackByFunction } from '@angular/core';

export class EntityQuery<
  State extends EntityState<T>,
  E = any,
  T extends Record<any, any> = EntityType<State>
> extends Query<State, E> {
  /**
   * @template T
   * @param {EntityStore<State, E, T>} store the store that this query will be based on
   * @param {EntityQueryOptions<T>} options optional options
   */
  constructor(store: EntityStore<State, E, T>, private options?: EntityQueryOptions<T>) {
    super(store, { distinctUntilChanged: false });
    this._distinctUntilChangedFn = options?.distinctUntilChangedEntityFn ?? isObjectEqualShallow;
    this._distinctUntilChangedEntity = options?.distinctUntilChangedEntity ?? false;
  }

  private readonly _distinctUntilChangedEntity: boolean;
  private readonly _distinctUntilChangedFn: DistinctUntilChangedFn<T | undefined>;
  private readonly _entities$ = this.select('entities');

  private get _state(): EntityState<T> {
    return this._store.getState();
  }

  private get _entities(): StMap<T> {
    return this._state.entities;
  }

  private _activeKeys$ = this.select('activeKeys');

  /**
   * @description observable with the current entities, uses {@link StMapView}
   * @type {Observable<StMapView<T>>}
   */
  readonly all$: Observable<StMapView<T>> = this._entities$.pipe(map(entities => entities.toView()));
  /**
   * @description observable with the current active ids
   * @type {Observable<Set<EntityIdType>>}
   */
  readonly activeIds$: Observable<Set<EntityIdType>> = this._activeKeys$;
  /**
   * @description observable with the current active entities
   * @type {Observable<StMapView<T>>}
   */
  readonly active$: Observable<StMapView<T>> = this.activeIds$.pipe(switchMap(ids => this.selectMany(ids)));
  /**
   * @description observable with a boolean value indicating if there's any entity active
   * @type {Observable<boolean>}
   */
  readonly hasActive$: Observable<boolean> = this._activeKeys$.pipe(map(activeKeys => !!activeKeys.size));

  /**
   * @description a {@link TrackByFunction} based on the idGetter
   * @type {TrackByFunction<T>}
   */
  readonly trackBy: TrackByFunction<T> = this._entities.trackBy;

  /**
   * @description returns a snapshot of all entities
   * @returns {StMapView<T>}
   */
  getAll(): StMapView<T> {
    return this._entities.toView();
  }

  /**
   * @description returns a snapshot of all active entities
   * @returns {StMapView<T>}
   */
  getActive(): StMapView<T> {
    const activeKeys = this._state.activeKeys;
    return this.getAll().filter((_, key) => activeKeys.has(key));
  }

  /**
   * @description check if the entity exists in the store
   * @param {Set<EntityIdType> | EntityIdType | EntityIdType[] | EntityPredicate<T>} idOrIdsOrCallback
   * @returns {boolean}
   */
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

  /**
   * @description check if there's any active entity
   * @returns {boolean}
   */
  hasActive(): boolean {
    return !!this._state.activeKeys.size;
  }

  /**
   * @description select an entity based on an id
   * @param {EntityIdType} id
   * @returns {Observable<T | undefined>}
   */
  selectEntity(id: EntityIdType): Observable<T | undefined>;
  /**
   * @description select a entity based on an predicate
   * @param {EntityPredicate<T>} callback
   * @returns {Observable<T | undefined>}
   */
  selectEntity(callback: EntityPredicate<T>): Observable<T | undefined>;
  /**
   * @description select one property of an entity
   * @param {EntityIdType | EntityPredicate<T>} idOrCallback
   * @param {KEY} property
   * @returns {Observable<T[KEY] | undefined>}
   */
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
    if (this._distinctUntilChangedEntity) {
      entity$ = entity$.pipe(distinctUntilChanged(this._distinctUntilChangedFn));
    }
    return entity$;
  }

  /**
   * @description returns a snapshot of an entity
   * @param {EntityIdType} key
   * @returns {T | undefined}
   */
  getEntity(key: EntityIdType): T | undefined;
  /**
   * @description returns a snapshot of a property of an entity
   * @param {EntityIdType} key
   * @param {KEY} property
   * @returns {T[KEY] | undefined}
   */
  getEntity<KEY extends keyof T>(key: EntityIdType, property: KEY): T[KEY] | undefined;
  getEntity<KEY extends keyof T>(key: EntityIdType, property?: KEY): T | T[KEY] | undefined {
    const entity = this._entities.get(key);
    return property ? entity?.[property] : entity;
  }

  /**
   * @description returns an observable with many entities
   * @param {Set<EntityIdType> | EntityIdType[] | EntityPredicate<T>} keysOrCallback
   * @returns {Observable<StMapView<T>>}
   */
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

  /**
   * @description returns an observable with all entities, with options to filter and order
   * @param {EntityFilterOptions<T>} options if not set, returns the same as the {@link EntityQuery#all$}
   * @returns {Observable<StMapView<T>>}
   */
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
