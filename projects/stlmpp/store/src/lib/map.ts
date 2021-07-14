import {
  IdGetter,
  IdGetterFn,
  isArray,
  isFunction,
  isObjectEmpty,
  normalizeString,
  orderBy,
  OrderByDirection,
  OrderByType,
  parseIdGetter,
} from 'st-utils';
import { predictIdType, toEntities } from './util';
import {
  EntityFn,
  EntityIdType,
  EntityMergeFn,
  EntityPartialUpdate,
  EntityPredicate,
  EntityUpdateWithId,
  StMapMergeOptions,
} from './type';
import { TrackByFunction } from '@angular/core';
import { ConditionalKeys } from 'type-fest';

const stMapSymbol = Symbol('StMap');

export abstract class StMapBase<T extends Record<any, any>> {
  /**
   * @template T
   * @param {IdGetter<T>} idGetter
   * @protected
   */
  protected constructor(idGetter: IdGetter<T, keyof T>) {
    if (!idGetter) {
      throw new Error('IdGetter is required');
    }
    this._idGetter = parseIdGetter(idGetter);
  }

  protected readonly _idGetter: IdGetterFn<T>;
  protected _state: Record<string, T> = {};
  protected _keys = new Set<EntityIdType>();

  readonly [stMapSymbol] = true;

  protected _search<K extends ConditionalKeys<T, string>>(
    map: StMapView<T>,
    keyOrKeysOrCallback: K | K[] | EntityFn<T, string>,
    term: string
  ): StMapView<T>;
  protected _search<K extends ConditionalKeys<T, string>>(
    map: StMap<T>,
    keyOrKeysOrCallback: K | K[] | EntityFn<T, string>,
    term: string
  ): StMap<T>;
  protected _search<K extends ConditionalKeys<T, string>>(
    map: StMapView<T> | StMap<T>,
    keyOrKeysOrCallback: K | K[] | EntityFn<T, string>,
    term: string
  ): StMap<T> | StMapView<T> {
    let predicate: EntityPredicate<T>;
    term = normalizeString(term).toLowerCase();
    if (isFunction(keyOrKeysOrCallback)) {
      predicate = (entity, key) => normalizeString(keyOrKeysOrCallback(entity, key).toLowerCase()).includes(term);
    } else if (isArray(keyOrKeysOrCallback)) {
      predicate = entity =>
        keyOrKeysOrCallback.some(keySearch => normalizeString(entity[keySearch]).toLowerCase().includes(term));
    } else {
      predicate = entity => normalizeString(entity[keyOrKeysOrCallback]).toLowerCase().includes(term);
    }
    return map.filter(predicate);
  }

  /**
   * @description TrackByFunction based on the idGetter
   */
  readonly trackBy: TrackByFunction<T> = (_, element) => this._idGetter(element);

  /**
   * @description returns a snapshot of the map state
   * @returns {Record<string, T>}
   */
  get state(): Record<string, T> {
    return { ...this._state };
  }

  /**
   * @description length of the map
   * @returns {number}
   */
  get length(): number {
    return this._keys.size;
  }

  /**
   * @description returns a Set of keys of the map
   * @returns {Set<EntityIdType>}
   */
  get keys(): Set<EntityIdType> {
    return this._keys;
  }

  /**
   * @description returns a tuple of id and entity
   * @returns {[EntityIdType, T][]}
   */
  get entries(): [EntityIdType, T][] {
    const tuple: [EntityIdType, T][] = [];
    for (const key of this.keys) {
      tuple.push([key, this.get(key)!]);
    }
    return tuple;
  }

  /**
   * @description returns the keys as an array
   * @returns {EntityIdType[]}
   */
  get keysArray(): EntityIdType[] {
    return [...this._keys];
  }

  /**
   * @description returns the entities as an array
   * @returns {T[]}
   */
  get values(): T[] {
    const values: T[] = [];
    for (const key of this.keys) {
      values.push(this.get(key)!);
    }
    return values;
  }

  /**
   * @description check if the entity exists. Similar to {@link Map#has}
   * @param {EntityIdType} key
   * @returns {boolean}
   */
  has(key: EntityIdType): boolean {
    return this._keys.has(key);
  }

  /**
   * @description returns the entity by the key. Similar to {@link Map#get}
   * @param {EntityIdType} key
   * @returns {T | undefined}
   */
  get(key: EntityIdType): T | undefined {
    return this._state[key];
  }

  /**
   * @description order the map
   * @param {OrderByType<T>} order
   * @param {OrderByDirection} direction
   * @returns {this}
   */
  orderBy(order?: OrderByType<T>, direction: OrderByDirection = 'asc'): this {
    if (!order) {
      this._keys = new Set(orderBy([...this._keys], undefined, direction));
    } else {
      const entitiesOrdered = orderBy(this.values, order, direction);
      this._keys = new Set(entitiesOrdered.map(this._idGetter));
    }
    return this;
  }

  /**
   * @description check if any of the keys exists in the map
   * @param {EntityIdType[]} keys
   * @returns {boolean}
   */
  hasAny(keys: EntityIdType[]): boolean {
    const keySet = new Set(keys);
    return this.some((_, key) => keySet.has(key));
  }

  /**
   * @description check if the all the keys exists in the map
   * @param {EntityIdType[]} keys
   * @returns {boolean}
   */
  hasAll(keys: EntityIdType[]): boolean {
    const keySet = new Set(keys);
    return this.every((_, key) => keySet.has(key));
  }

  abstract filter(callback: EntityPredicate<T>): StMap<T> | StMapView<T>;
  abstract map<R extends Record<any, any>>(callback: EntityUpdateWithId<T, R>): StMap<R> | StMapView<R>;
  abstract find(callback: EntityPredicate<T>): T | undefined;
  abstract forEach(callback: EntityFn<T, void>): void;
  abstract some(callback: EntityPredicate<T>): boolean;
  abstract every(callback: EntityPredicate<T>): boolean;
  abstract reduce<R>(callback: (accumulator: R, item: [EntityIdType, T]) => R, initialValue: R): R;
  abstract findKey(callback: EntityPredicate<T>): EntityIdType | undefined;
  abstract search<K extends ConditionalKeys<T, string>>(
    keyOrKeysOrCallback: K[] | EntityFn<T, string> | K,
    term: string
  ): StMapView<T> | StMap<T>;

  /**
   * @description check if the value is a StMap
   * @param value
   * @returns {value is StMapBase<E>}
   */
  static isStMap<E extends Record<any, any>>(value: any): value is StMapBase<E> {
    return value?.[stMapSymbol] || value instanceof StMapBase;
  }
}

export class StMap<T extends Record<any, any>> extends StMapBase<T> {
  /**
   * @template T
   * @param {IdGetter<T>} idGetter used to get the id of an entity {@link IdGetter}
   * @param {EntityMergeFn} merger used to merge the entities in the update
   */
  constructor(
    idGetter: IdGetter<T, keyof T>,
    public merger: EntityMergeFn = (entityA, entityB) => ({ ...entityA, ...entityB })
  ) {
    super(idGetter);
  }

  private _formatEntities(entities: StMap<T> | T[] | Record<string, T>): T[] | undefined {
    if (!entities) {
      return;
    }
    if (StMapBase.isStMap(entities) || isArray(entities)) {
      if (!entities.length) {
        return;
      }
      if (StMapBase.isStMap(entities)) {
        entities = entities.values;
      }
    } else {
      if (isObjectEmpty(entities)) {
        return;
      }
      entities = Object.values(entities);
    }
    return entities;
  }

  private _upsertOne(key: EntityIdType, entity: T | Partial<T>): this {
    if (this.has(key)) {
      return this.update(key, entity);
    } else {
      return this.set(key, entity as T);
    }
  }

  private _upsertMany(newEntities: T[] | Partial<T>[]): this {
    const [newNewEntities, newKeys] = toEntities(newEntities as T[], this._idGetter);
    const allKeys = new Set([...this._keys, ...newKeys]);
    this._state = [...allKeys].reduce((entities, key) => {
      const currentItem = this.get(key)!;
      const newItem = newNewEntities[key];
      return { ...entities, [key]: this.merger(currentItem, newItem) };
    }, {});
    this._keys = allKeys;
    return this;
  }

  private _createMap(): StMap<T> {
    return new StMap<T>(this._idGetter, this.merger);
  }

  // Non-mutators

  *[Symbol.iterator](): Iterator<[EntityIdType, T]> {
    for (const key of this._keys) {
      yield [key, this.get(key)!];
    }
  }

  get [Symbol.toStringTag](): string {
    return 'StMap';
  }

  /**
   * @description creates a new {@link StMap} with the predicate. Similar to {@link Array#filter}
   * @param {EntityPredicate<T>} callback
   * @returns {StMap<T>}
   */
  filter(callback: EntityPredicate<T>): StMap<T> {
    const stMap = this._createMap();
    for (const [key, entity] of this) {
      if (callback(entity, key)) {
        stMap.set(key, entity);
      }
    }
    return stMap;
  }

  /**
   * @description creates a new {@link StMap} with transformed data based on the predicate. Similar to {@link Array#map}
   * @param {EntityUpdateWithId<T, R>} callback
   * @returns {StMap<R>}
   */
  map<R extends Record<any, any>>(callback: EntityUpdateWithId<T, R>): StMap<R> {
    const stMap = this._createMap();
    for (const [key, entity] of this) {
      stMap.set(key, callback(entity, key));
    }
    return stMap;
  }

  /**
   * @description tries to find an entity in the map based on a predicate. Similar to {@link Array#find}
   * @param {EntityPredicate<T>} callback
   * @returns {T | undefined}
   */
  find(callback: EntityPredicate<T>): T | undefined {
    for (const [key, entity] of this) {
      if (callback(entity, key)) {
        return entity;
      }
    }
    return undefined;
  }

  /**
   * @description tries to find a key in the map based on a predicate
   * @param {EntityPredicate<T>} callback
   * @returns {EntityIdType | undefined}
   */
  findKey(callback: EntityPredicate<T>): EntityIdType | undefined {
    for (const [key, entity] of this) {
      if (callback(entity, key)) {
        return key;
      }
    }
    return undefined;
  }

  /**
   * @description calls the predicate on every item of the map. Similar to {@link Array#forEach}
   * @param {EntityFn<T, void>} callback
   */
  forEach(callback: EntityFn<T, void>): void {
    for (const [key, entity] of this) {
      callback(entity, key);
    }
  }

  /**
   * @description returns true if any entity of the map matches the predicate. Similar to {@link Array#some}
   * @param {EntityPredicate<T>} callback
   * @returns {boolean}
   */
  some(callback: EntityPredicate<T>): boolean {
    for (const [key, entity] of this) {
      if (callback(entity, key)) {
        return true;
      }
    }
    return false;
  }

  /**
   * @description returns true if all entities of the map matches the predicate. Similar to {@link Array#every}
   * @param {EntityPredicate<T>} callback
   * @returns {boolean}
   */
  every(callback: EntityPredicate<T>): boolean {
    for (const [key, entity] of this) {
      if (!callback(entity, key)) {
        return false;
      }
    }
    return true;
  }

  /**
   * @description reduces the map to something else. Similar to {@link Array#reduce}
   * @param {(accumulator: R, item: [EntityIdType, T]) => R} callback
   * @param {R} initialValue
   * @returns {R}
   */
  reduce<R>(callback: (accumulator: R, item: [EntityIdType, T]) => R, initialValue: R): R {
    let acc = initialValue;
    for (const pair of this) {
      acc = callback(acc, pair);
    }
    return acc;
  }

  // Mutators

  /**
   * @description set a new entity in the map. Similar to {@link Map#set}
   * @param {EntityIdType} key
   * @param {T} value
   * @returns {this}
   */
  set(key: EntityIdType, value: T): this {
    this._state = { ...this._state, [key]: value };
    this._keys.add(key);
    return this;
  }

  /**
   * @description set multiples entities in the map
   * @param {T[] | StMap<T> | Record<string, T>} entities
   * @returns {this}
   */
  setMany(entities: T[] | StMap<T> | Record<string, T>): this {
    const newEntities = this._formatEntities(entities);
    if (!newEntities?.length) {
      return this;
    }
    this.fromArray([...this.values, ...newEntities]);
    return this;
  }

  /**
   * @description removes the last entity of the map and returns it. Similar to {@link Array#pop}
   * @returns {T | undefined}
   */
  pop(): T | undefined {
    if (!this.length) {
      return undefined;
    }
    const keys = this.keysArray;
    const lastKey = keys[keys.length - 1];
    const entity = this.get(lastKey);
    this.remove(lastKey);
    return entity;
  }

  /**
   * @description removes the first entity of the map and returns it. Similar to {@link Array#shift}
   * @returns {T | undefined}
   */
  shift(): T | undefined {
    if (!this.length) {
      return undefined;
    }
    const [firstKey] = this.keysArray;
    const entity = this.get(firstKey);
    this.remove(firstKey);
    return entity;
  }

  /**
   * @description set a new entity in the map
   * @param {T} entity
   * @returns {this}
   */
  fromEntity(entity: T): this {
    this.set(this._idGetter(entity), entity);
    return this;
  }

  /**
   * @description set new entities in the map based on an array
   * @param {T[]} entities
   * @returns {this}
   */
  fromArray(entities: T[]): this {
    if (!entities?.length) {
      return this.clear();
    }
    const [newEntities, keys] = toEntities(entities, this._idGetter);
    this._state = newEntities;
    this._keys = keys;
    return this;
  }

  /**
   * @description set new entities in the map based on an object
   * @param {Record<string, T>} entities
   * @param {boolean} idIsNumber if not set, the method will try to predict the type using the function {@link predictIdType}
   * @returns {this}
   */
  fromObject(entities: Record<string, T>, idIsNumber?: boolean): this {
    if (!entities || isObjectEmpty(entities)) {
      return this.clear();
    }
    let format: (key: any) => any;
    if (idIsNumber) {
      format = Number as any;
    } else {
      format = predictIdType(entities, this._idGetter);
    }
    this._state = entities;
    this._keys = new Set(Object.keys(entities).map(format));
    return this;
  }

  /**
   * @description set new entities in the map base on an array of tuples
   * @param {[EntityIdType, T][]} entities
   * @returns {this}
   */
  fromTuple(entities: [EntityIdType, T][]): this {
    if (!entities?.length) {
      return this.clear();
    }
    this._state = [...entities].reduce((obj, [key, entity]) => ({ [key]: entity }), {});
    this._keys = new Set(entities.map(([key]) => key));
    return this;
  }

  /**
   * @description merge entities in the map.
   * @param {StMap<T> | T[] | Record<string, T>} entities
   * @param {StMapMergeOptions} options
   * @returns {this}
   */
  merge(entities: StMap<T> | T[] | Record<string, T>, options: StMapMergeOptions = {}): this {
    let newEntities = this._formatEntities(entities);
    if (!newEntities?.length) {
      return this;
    }
    if (!options.upsert) {
      newEntities = newEntities.filter(entity => this.has(this._idGetter(entity)));
    }
    this._upsertMany(newEntities);
    return this;
  }

  /**
   * @description update one entity in the map
   * @param {EntityIdType} key
   * @param {EntityPartialUpdate<T>} partialOrCallback
   * @returns {this}
   */
  update(key: EntityIdType, partialOrCallback: EntityPartialUpdate<T>): this {
    const entity = this.get(key);
    if (!entity) {
      return this;
    }
    const callback = isFunction(partialOrCallback)
      ? partialOrCallback
      : (entity1: T) => this.merger(entity1, partialOrCallback);
    this._state = {
      ...this._state,
      [key]: callback(entity),
    };
    return this;
  }

  /**
   * @description upsert one or many entities in the map
   * @param {Array<Partial<T> | T> | EntityIdType} keyOrEntities
   * @param {Partial<T> | T} entity
   * @returns {this}
   */
  upsert(keyOrEntities: Array<T | Partial<T>> | EntityIdType, entity?: T | Partial<T>): this {
    if (isArray(keyOrEntities)) {
      return this._upsertMany(keyOrEntities);
    } else {
      return this._upsertOne(keyOrEntities, entity!);
    }
  }

  /**
   * @description removes one or many entities from the map
   * @param {EntityIdType | EntityIdType[] | EntityPredicate<T>} idOrIdsOrCallback
   * @returns {this}
   */
  remove(idOrIdsOrCallback: EntityIdType | EntityIdType[] | EntityPredicate<T>): this {
    let predicate: EntityPredicate<T>;
    if (isFunction(idOrIdsOrCallback)) {
      predicate = (entity, key) => !idOrIdsOrCallback(entity, key);
    } else if (isArray(idOrIdsOrCallback)) {
      const idsSet = new Set(idOrIdsOrCallback);
      predicate = (_, key) => !idsSet.has(key);
    } else {
      predicate = (_, key) => key !== idOrIdsOrCallback;
    }
    const newMap = this.filter(predicate);
    this._state = newMap.state;
    this._keys = newMap.keys;
    return this;
  }

  /**
   * @description removes all entities from the map
   * @returns {this}
   */
  clear(): this {
    this._state = {};
    this._keys.clear();
    return this;
  }

  /**
   * @description transform {@link StMap} into {@link StMapView}
   * @returns {StMapView<T>}
   */
  toView(): StMapView<T> {
    return new StMapView<T>(this._idGetter).setState(this._state, this._keys);
  }

  /**
   * @description search items in the array based in a predicate. Can only be used with string values.
   * @param {K[] | EntityFn<T, string> | K} keyOrKeysOrCallback
   * @param {string} term
   * @returns {StMap<T>}
   */
  search<K extends ConditionalKeys<T, string>>(
    keyOrKeysOrCallback: K[] | EntityFn<T, string> | K,
    term: string
  ): StMap<T> {
    return super._search(this, keyOrKeysOrCallback, term);
  }
}

/**
 * @template T
 */
export class StMapView<T extends Record<any, any>> extends StMapBase<T> {
  *[Symbol.iterator](): Iterator<T> {
    for (const key of this._keys) {
      yield this.get(key)!;
    }
  }

  get [Symbol.toStringTag](): string {
    return 'StMapView';
  }

  /**
   * @description creates a new {@link StMapView} with the predicate. Similar to {@link Array#filter}
   * @param {EntityPredicate<T>} callback
   * @returns {StMapView<T>}
   */
  filter(callback: EntityPredicate<T>): StMapView<T> {
    const stMap = new StMap<T>(this._idGetter);
    for (const [key, entity] of this.entries) {
      if (callback(entity, key)) {
        stMap.set(key, entity);
      }
    }
    return stMap.toView();
  }

  /**
   * @description creates a new {@link StMapView} with transformed data based on the predicate. Similar to {@link Array#map}
   * @param {EntityUpdateWithId<T, R>} callback
   * @returns {StMapView<R>}
   */
  map<R extends Record<any, any>>(callback: EntityUpdateWithId<T, R>): StMapView<R> {
    const stMap = new StMap<T>(this._idGetter);
    for (const [key, entity] of this.entries) {
      stMap.set(key, callback(entity, key));
    }
    return stMap.toView();
  }

  /**
   * @description tries to find an entity in the map based on a predicate. Similar to {@link Array#find}
   * @param {EntityPredicate<T>} callback
   * @returns {T | undefined}
   */
  find(callback: EntityPredicate<T>): T | undefined {
    for (const [key, entity] of this.entries) {
      if (callback(entity, key)) {
        return entity;
      }
    }
    return undefined;
  }

  /**
   * @description tries to find a key in the map based on a predicate
   * @param {EntityPredicate<T>} callback
   * @returns {EntityIdType | undefined}
   */
  findKey(callback: EntityPredicate<T>): EntityIdType | undefined {
    for (const [key, entity] of this.entries) {
      if (callback(entity, key)) {
        return key;
      }
    }
    return undefined;
  }

  /**
   * @description calls the predicate on every item of the map. Similar to {@link Array#forEach}
   * @param {(entity: T, key: EntityIdType) => void} callback
   */
  forEach(callback: (entity: T, key: EntityIdType) => void): void {
    for (const [key, entity] of this.entries) {
      callback(entity, key);
    }
  }

  /**
   * @description returns true if any entity of the map matches the predicate. Similar to {@link Array#some}
   * @param {EntityPredicate<T>} callback
   * @returns {boolean}
   */
  some(callback: EntityPredicate<T>): boolean {
    for (const [key, entity] of this.entries) {
      if (callback(entity, key)) {
        return true;
      }
    }
    return false;
  }

  /**
   * @description returns true if all entities of the map matches the predicate. Similar to {@link Array#every}
   * @param {EntityPredicate<T>} callback
   * @returns {boolean}
   */
  every(callback: EntityPredicate<T>): boolean {
    for (const [key, entity] of this.entries) {
      if (!callback(entity, key)) {
        return false;
      }
    }
    return true;
  }

  /**
   * @description reduces the map to something else. Similar to {@link Array#reduce}
   * @param {(accumulator: R, item: [EntityIdType, T]) => R} callback
   * @param {R} initialValue
   * @returns {R}
   */
  reduce<R>(callback: (accumulator: R, item: [EntityIdType, T]) => R, initialValue: R): R {
    let acc = initialValue;
    for (const pair of this.entries) {
      acc = callback(acc, pair);
    }
    return acc;
  }

  /** @internal */
  setState(state: Record<string, T>, keys: Set<EntityIdType>): this {
    this._state = state;
    this._keys = keys;
    return this;
  }

  /**
   * @description search items in the array based in a predicate. Can only be used with string values.
   * @param {K[] | EntityFn<T, string> | K} keyOrKeysOrCallback
   * @param {string} term
   * @returns {StMapView<T>}
   */
  search<K extends ConditionalKeys<T, string>>(
    keyOrKeysOrCallback: K[] | EntityFn<T, string> | K,
    term: string
  ): StMapView<T> {
    return super._search(this, keyOrKeysOrCallback, term);
  }
}
