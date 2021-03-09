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
  protected constructor(idGetter: IdGetter<T, keyof T>) {
    if (!idGetter) {
      throw new Error('IdGetter is required');
    }
    this._idGetter = parseIdGetter(idGetter);
  }

  protected readonly _idGetter: IdGetterFn<T>;
  protected _state: { [id: string]: T } = {};
  protected _keys = new Set<EntityIdType>();

  [stMapSymbol] = true;

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

  trackBy: TrackByFunction<T> = (_, element) => this._idGetter(element);

  get state(): { [id: string]: T } {
    return { ...this._state };
  }

  get length(): number {
    return this._keys.size;
  }

  get keys(): Set<EntityIdType> {
    return this._keys;
  }

  get entries(): [EntityIdType, T][] {
    const tupple: [EntityIdType, T][] = [];
    for (const key of this.keys) {
      tupple.push([key, this.get(key)!]);
    }
    return tupple;
  }

  get keysArray(): EntityIdType[] {
    return [...this._keys];
  }

  get values(): T[] {
    const values: T[] = [];
    for (const key of this.keys) {
      values.push(this.get(key)!);
    }
    return values;
  }

  has(key: EntityIdType): boolean {
    return this._keys.has(key);
  }

  get(key: EntityIdType): T | undefined {
    return this._state[key];
  }

  orderBy(order?: OrderByType<T>, direction: OrderByDirection = 'asc'): this {
    if (!order) {
      this._keys = new Set(orderBy([...this._keys], undefined, direction));
    } else {
      const entitiesOrdered = orderBy(this.values, order, direction);
      this._keys = new Set(entitiesOrdered.map(this._idGetter));
    }
    return this;
  }

  hasAny(keys: EntityIdType[]): boolean {
    const keySet = new Set(keys);
    return this.some((_, key) => keySet.has(key));
  }

  hasAll(keys: EntityIdType[]): boolean {
    const keySet = new Set(keys);
    return this.every((_, key) => keySet.has(key));
  }

  abstract filter(callback: EntityPredicate<T>): StMap<T> | StMapView<T>;
  abstract map(callback: EntityUpdateWithId<T>): StMap<T> | StMapView<T>;
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

  static isStMap<E extends Record<any, any>>(value: any): value is StMapBase<E> {
    return value?.[stMapSymbol] || value instanceof StMapBase;
  }
}

export class StMap<T extends Record<any, any>> extends StMapBase<T> {
  constructor(
    idGetter: IdGetter<T, keyof T>,
    public merger: EntityMergeFn = (entityA, entityB) => ({ ...entityA, ...entityB })
  ) {
    super(idGetter);
  }

  private _formatEntities(entities: StMap<T> | T[] | { [id: string]: T }): T[] | undefined {
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
    const [newEntites, newKeys] = toEntities(newEntities as T[], this._idGetter);
    const allKeys = new Set([...this._keys, ...newKeys]);
    this._state = [...allKeys].reduce((entities, key) => {
      const currentItem = this.get(key)!;
      const newItem = newEntites[key];
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

  filter(callback: EntityPredicate<T>): StMap<T> {
    const stMap = this._createMap();
    for (const [key, entity] of this) {
      if (callback(entity, key)) {
        stMap.set(key, entity);
      }
    }
    return stMap;
  }

  map(callback: EntityUpdateWithId<T>): StMap<T> {
    const stMap = this._createMap();
    for (const [key, entity] of this) {
      stMap.set(key, callback(entity, key));
    }
    return stMap;
  }

  find(callback: EntityPredicate<T>): T | undefined {
    for (const [key, entity] of this) {
      if (callback(entity, key)) {
        return entity;
      }
    }
    return undefined;
  }

  findKey(callback: EntityPredicate<T>): EntityIdType | undefined {
    for (const [key, entity] of this) {
      if (callback(entity, key)) {
        return key;
      }
    }
    return undefined;
  }

  forEach(callback: EntityFn<T, void>): void {
    for (const [key, entity] of this) {
      callback(entity, key);
    }
  }

  some(callback: EntityPredicate<T>): boolean {
    for (const [key, entity] of this) {
      if (callback(entity, key)) {
        return true;
      }
    }
    return false;
  }

  every(callback: EntityPredicate<T>): boolean {
    for (const [key, entity] of this) {
      if (!callback(entity, key)) {
        return false;
      }
    }
    return true;
  }

  reduce<R>(callback: (accumulator: R, item: [EntityIdType, T]) => R, initialValue: R): R {
    let acc = initialValue;
    for (const pair of this) {
      acc = callback(acc, pair);
    }
    return acc;
  }

  // Mutators

  set(key: EntityIdType, value: T): this {
    this._state = { ...this._state, [key]: value };
    this._keys.add(key);
    return this;
  }

  setMany(entities: T[] | StMap<T> | { [id: string]: T }): this {
    const newEntities = this._formatEntities(entities);
    if (!newEntities?.length) {
      return this;
    }
    this.fromArray([...this.values, ...newEntities]);
    return this;
  }

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

  shift(): T | undefined {
    if (!this.length) {
      return undefined;
    }
    const [firstKey] = this.keysArray;
    const entity = this.get(firstKey);
    this.remove(firstKey);
    return entity;
  }

  fromEntity(entity: T): this {
    this.set(this._idGetter(entity), entity);
    return this;
  }

  fromArray(entities: T[]): this {
    if (!entities?.length) {
      return this.clear();
    }
    const [newEntities, keys] = toEntities(entities, this._idGetter);
    this._state = newEntities;
    this._keys = keys;
    return this;
  }

  fromObject(entities: { [id: string]: T }, idIsNumber?: boolean): this {
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

  fromTuple(entities: [EntityIdType, T][]): this {
    if (!entities?.length) {
      return this.clear();
    }
    this._state = [...entities].reduce((obj, [key, entity]) => ({ [key]: entity }), {});
    this._keys = new Set(entities.map(([key]) => key));
    return this;
  }

  merge(entities: StMap<T> | T[] | { [id: string]: T }, options: StMapMergeOptions = {}): this {
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

  upsert(keyOrEntities: Array<T | Partial<T>> | EntityIdType, entity?: T | Partial<T>): this {
    if (isArray(keyOrEntities)) {
      return this._upsertMany(keyOrEntities);
    } else {
      return this._upsertOne(keyOrEntities, entity!);
    }
  }

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

  clear(): this {
    this._state = {};
    this._keys.clear();
    return this;
  }

  toView(): StMapView<T> {
    return new StMapView<T>(this._idGetter).setState(this._state, this._keys);
  }

  search<K extends ConditionalKeys<T, string>>(
    keyOrKeysOrCallback: K[] | EntityFn<T, string> | K,
    term: string
  ): StMap<T> {
    return super._search(this, keyOrKeysOrCallback, term);
  }
}

export class StMapView<T extends Record<any, any>> extends StMapBase<T> {
  *[Symbol.iterator](): Iterator<T> {
    for (const key of this._keys) {
      yield this.get(key)!;
    }
  }

  get [Symbol.toStringTag](): string {
    return 'StMapView';
  }

  filter(callback: EntityPredicate<T>): StMapView<T> {
    const stMap = new StMap<T>(this._idGetter);
    for (const [key, entity] of this.entries) {
      if (callback(entity, key)) {
        stMap.set(key, entity);
      }
    }
    return stMap.toView();
  }

  map(callback: EntityUpdateWithId<T>): StMapView<T> {
    const stMap = new StMap<T>(this._idGetter);
    for (const [key, entity] of this.entries) {
      stMap.set(key, callback(entity, key));
    }
    return stMap.toView();
  }

  find(callback: EntityPredicate<T>): T | undefined {
    for (const [key, entity] of this.entries) {
      if (callback(entity, key)) {
        return entity;
      }
    }
    return undefined;
  }

  findKey(callback: EntityPredicate<T>): EntityIdType | undefined {
    for (const [key, entity] of this.entries) {
      if (callback(entity, key)) {
        return key;
      }
    }
    return undefined;
  }

  forEach(callback: (entity: T, key: EntityIdType) => void): void {
    for (const [key, entity] of this.entries) {
      callback(entity, key);
    }
  }

  some(callback: EntityPredicate<T>): boolean {
    for (const [key, entity] of this.entries) {
      if (callback(entity, key)) {
        return true;
      }
    }
    return false;
  }

  every(callback: EntityPredicate<T>): boolean {
    for (const [key, entity] of this.entries) {
      if (!callback(entity, key)) {
        return false;
      }
    }
    return true;
  }

  reduce<R>(callback: (accumulator: R, item: [EntityIdType, T]) => R, initialValue: R): R {
    let acc = initialValue;
    for (const pair of this.entries) {
      acc = callback(acc, pair);
    }
    return acc;
  }

  /** @internal */
  setState(state: { [id: string]: T }, keys: Set<EntityIdType>): this {
    this._state = state;
    this._keys = keys;
    return this;
  }

  search<K extends ConditionalKeys<T, string>>(
    keyOrKeysOrCallback: K[] | EntityFn<T, string> | K,
    term: string
  ): StMapView<T> {
    return super._search(this, keyOrKeysOrCallback, term);
  }
}
