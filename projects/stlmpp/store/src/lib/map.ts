import { isArray, isFunction } from 'lodash-es';
import { predictIdType, isObjectEmpty, toEntities } from './utils';
import { ID, IdGetter, idGetterFactory, IdGetterType, isID } from '@stlmpp/utils';
import {
  EntityMergeFn,
  EntityPartialUpdate,
  EntityPredicate,
  EntityUpdate,
  EntityUpdateWithId,
  StMapMergeOptions,
} from './type';

export class StMap<T, S extends ID = number> implements Iterable<[S, T]> {
  constructor(
    _idGetter: IdGetterType<T, S>,
    public merger: EntityMergeFn = (entityA, entityB) => ({ ...entityA, ...entityB })
  ) {
    if (!_idGetter) {
      throw new Error('IdGetter is required');
    }
    this.idGetter = idGetterFactory(_idGetter);
  }

  private readonly idGetter: IdGetter<T, S>;
  private __state: { [K in S]?: T } = {};
  private __keys = new Set<S>();

  *[Symbol.iterator](): Iterator<[S, T]> {
    for (const key of this.__keys) {
      yield [key, this.get(key)!];
    }
  }

  get state(): { [K in S]?: T } {
    return { ...this.__state };
  }

  get length(): number {
    return this.__keys.size;
  }

  get keys(): Set<S> {
    return this.__keys;
  }

  get entries(): [S, T][] {
    return this.keysArray.map(key => [key, this.get(key)!]);
  }

  get keysArray(): S[] {
    return [...this.__keys];
  }

  get values(): T[] {
    return this.keysArray.map(key => this.get(key)!);
  }

  filter(callback: EntityPredicate<T, S>): StMap<T, S> {
    const stMap = new StMap<T, S>(this.idGetter);
    for (const [key, entity] of this) {
      if (callback(entity, key)) {
        stMap.set(key, entity);
      }
    }
    return stMap;
  }

  map(callback: EntityUpdateWithId<T, S>): StMap<T, S> {
    const stMap = new StMap<T, S>(this.idGetter);
    for (const [key, entity] of this) {
      stMap.set(key, callback(entity, key));
    }
    return stMap;
  }

  find(callback: EntityPredicate<T, S>): T | undefined {
    for (const [key, entity] of this) {
      if (callback(entity, key)) {
        return entity;
      }
    }
    return undefined;
  }

  forEach(callback: (entity: T, key: S) => void): void {
    for (const [key, entity] of this) {
      callback(entity, key);
    }
  }

  some(callback: EntityPredicate<T, S>): boolean {
    for (const [key, entity] of this) {
      if (callback(entity, key)) {
        return true;
      }
    }
    return false;
  }

  every(callback: EntityPredicate<T, S>): boolean {
    for (const [key, entity] of this) {
      if (!callback(entity, key)) {
        return false;
      }
    }
    return true;
  }

  reduce<R>(callback: (accumulator: R, item: [S, T]) => R, initialValue: R): R {
    let acc = initialValue;
    for (const pair of this) {
      acc = callback(acc, pair);
    }
    return acc;
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

  has(key: S): boolean {
    return this.__keys.has(key);
  }

  get(key: S): T | undefined {
    return this.__state[key];
  }

  set(key: S, value: T): this {
    this.__state = { ...this.__state, [key]: value };
    this.__keys.add(key);
    return this;
  }

  setMany(entities: T[]): this;
  setMany(entities: StMap<T, S>): this;
  setMany(entities: { [K in S]?: T }): this;
  setMany(entities: T[] | StMap<T, S> | { [K in S]?: T }): this {
    const newEntities = this.formatEntities(entities);
    if (!newEntities) {
      return this;
    }
    this.fromArray([...this.values, ...newEntities]);
    return this;
  }

  fromEntity(entity: T): this {
    this.set(this.idGetter(entity), entity);
    return this;
  }

  fromArray(entities: T[]): this {
    if (!entities?.length) {
      this.__state = {};
      this.__keys.clear();
      return this;
    }
    const [newEntities, keys] = toEntities(entities, this.idGetter);
    this.__state = newEntities;
    this.__keys = keys;
    return this;
  }

  fromObject(entities: { [K in S]?: T }, idIsNumber?: boolean): this {
    if (isObjectEmpty(entities)) {
      this.__state = {};
      this.__keys.clear();
      return this;
    }
    let format: (key: any) => any;
    if (idIsNumber) {
      format = Number as any;
    } else {
      format = predictIdType(entities, this.idGetter);
    }
    this.__state = entities;
    this.__keys = new Set(Object.keys(entities).map(format));
    return this;
  }

  fromTuple(entities: [S, T][]): this {
    if (!entities?.length) {
      this.__state = {};
      this.__keys.clear();
      return this;
    }
    this.__state = [...entities].reduce((obj, [key, entity]) => ({ [key]: entity }), {});
    this.__keys = new Set(entities.map(([key]) => key));
    return this;
  }

  merge(entities: T[], options?: StMapMergeOptions): this;
  merge(entities: StMap<T, S>, options?: StMapMergeOptions): this;
  merge(entities: { [K in S]?: T }, options?: StMapMergeOptions): this;
  merge(entities: StMap<T, S> | T[] | { [K in S]?: T }, options: StMapMergeOptions = {}): this {
    let newEntities = this.formatEntities(entities);
    if (!newEntities) {
      return this;
    }
    if (!options.upsert) {
      newEntities = newEntities.filter(entity => this.has(this.idGetter(entity)));
    }
    this.upsertMany(newEntities);
    return this;
  }

  private formatEntities(entities: StMap<T, S> | T[] | { [K in S]?: T }): T[] | undefined {
    if (!entities) {
      return;
    }
    if (entities instanceof StMap || isArray(entities)) {
      if (!entities.length) {
        return;
      }
      if (entities instanceof StMap) {
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

  update(key: S, partial: Partial<T>): this;
  update(key: S, callback: EntityUpdate<T>): this;
  update(key: S, partialOrCallback: EntityPartialUpdate<T>): this {
    const entity = this.get(key);
    if (!entity) {
      return this;
    }
    const callback = isFunction(partialOrCallback)
      ? partialOrCallback
      : (entity1: T) => this.merger(entity1, partialOrCallback);
    this.__state = {
      ...this.__state,
      [key]: callback(entity),
    };
    return this;
  }

  upsert(entities: Array<T | Partial<T>>): this;
  upsert(key: S, entity: T | Partial<T>): this;
  upsert(keyOrEntities: Array<T | Partial<T>> | S, entity?: T | Partial<T>): this;
  upsert(keyOrEntities: Array<T | Partial<T>> | S, entity?: T | Partial<T>): this {
    if (entity && isID(keyOrEntities)) {
      return this.upsertOne(keyOrEntities, entity as any);
    } else {
      return this.upsertMany(keyOrEntities as any[]);
    }
  }

  private upsertOne(key: S, entity: T): this;
  private upsertOne(key: S, entity: Partial<T>): this;
  private upsertOne(key: S, entity: T | Partial<T>): this {
    if (this.has(key)) {
      return this.update(key, entity as Partial<T>);
    } else {
      return this.set(key, entity as T);
    }
  }

  private upsertMany(newEntities: T[] | Partial<T>[]): this {
    const [newEntites, newKeys] = toEntities(newEntities as T[], this.idGetter);
    const allKeys = new Set([...this.__keys, ...newKeys]);
    this.__state = [...allKeys].reduce((entities, key) => {
      const currentItem = this.get(key);
      const newItem = newEntites[key];
      return { ...entities, [key]: this.merger(currentItem, newItem) };
    }, {});
    this.__keys = allKeys;
    return this;
  }

  remove(id: S): this;
  remove(ids: S[]): this;
  remove(callback: EntityPredicate<T, S>): this;
  remove(idOrIdsOrCallback: S | S[] | EntityPredicate<T, S>): this;
  remove(idOrIdsOrCallback: S | S[] | EntityPredicate<T, S>): this {
    const callback: EntityPredicate<T, S> = isFunction(idOrIdsOrCallback)
      ? (entity, key) => !idOrIdsOrCallback(entity, key)
      : isArray(idOrIdsOrCallback)
      ? (_, key) => !idOrIdsOrCallback.includes(key)
      : (_, key) => key !== idOrIdsOrCallback;
    const newMap = this.filter(callback);
    this.__state = newMap.state;
    this.__keys = newMap.keys;
    return this;
  }
}
