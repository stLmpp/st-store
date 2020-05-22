import { DeepPartial, ID, IdGetter } from './type';
import { isArray, isFunction, isPrimitive } from 'is-what';
import { deepMerge, toEntities } from './utils';

export class StMap<T, S extends ID = number> implements Iterable<T> {
  constructor(idGetter: IdGetter<T, S>) {
    this.setIdGetter(idGetter);
  }

  private __state: { [K in S]?: T } = {};
  private __keys = new Set<S>();

  idGetter: IdGetter<T, S>;

  *[Symbol.iterator](): Iterator<T> {
    for (const key of this.__keys) {
      yield this.get(key);
    }
  }

  get length(): number {
    return this.__keys.size;
  }

  entries(): [S, T][] {
    return this.values().map(entity => [this.idGetter(entity), entity]);
  }

  keys(): S[] {
    return [...this.__keys];
  }

  values(): T[] {
    return Object.values(this.__state);
  }

  private _filter(callback: (entity: T, key: S) => boolean): { [K in S]?: T } {
    return this.keys().reduce((filtered, key) => {
      const entity = this.get(key);
      if (callback(entity, key)) {
        return { ...filtered, [key]: entity };
      }
      return filtered;
    }, {});
  }

  filter(callback: (entity: T, key: S) => boolean): StMap<T, S> {
    return new StMap<T, S>(this.idGetter).fromObject(this._filter(callback));
  }

  private _map(callback: (entity: T, key: S) => T): { [K in S]?: T } {
    return this.keys().reduce((mapped, key) => {
      return {
        ...mapped,
        [key]: callback(this.get(key), key),
      };
    }, {});
  }

  map(callback: (entity: T, key: S) => T): StMap<T, S> {
    return new StMap<T, S>(this.idGetter).fromObject(this._map(callback));
  }

  find(callback: (entity: T, key: S) => boolean): T {
    return this.entries().find(([key, value]) => callback(value, key))[1];
  }

  setIdGetter(getter: IdGetter<T, S>): this {
    this.idGetter = getter;
    return this;
  }

  get(key: S): T {
    return this.__state[key];
  }

  set(key: S, value: T): this {
    this.__state = {
      ...this.__state,
      [key]: value,
    };
    this.__keys.add(key);
    return this;
  }

  fromArray(entities: T[]): this {
    if (!this.idGetter) {
      console.warn('No IdGetter set');
      return this;
    }
    const [newEntities, keys] = toEntities(entities, this.idGetter);
    this.__state = newEntities;
    this.__keys = keys;
    return this;
  }

  fromObject(entities: { [K in S]?: T }): this {
    this.__state = entities;
    this.__keys = new Set(this.values().map(entity => this.idGetter(entity)));
    return this;
  }

  merge(entities: T[]): this;
  merge(entities: StMap<T, S>): this;
  merge(entities: { [K in S]?: T }): this;
  merge(entities: StMap<T, S> | T[] | { [K in S]?: T }): this {
    if (entities instanceof StMap) {
      entities = entities.values();
    }
    if (isArray(entities)) {
      entities = toEntities(entities, this.idGetter)[0];
    }
    this.fromObject(deepMerge(this.__state, entities));
    return this;
  }

  has(key: S): boolean {
    return this.__keys.has(key);
  }

  update(key: S, partialOrCallback: DeepPartial<T> | ((entity: T) => T)): this {
    const entity = this.get(key);
    if (!entity) return;
    const callback = isFunction(partialOrCallback)
      ? partialOrCallback
      : entity1 => deepMerge(entity1, partialOrCallback);
    this.__state = {
      ...this.__state,
      [key]: callback(entity),
    };
    return this;
  }

  upsert(entities: Array<T | Partial<T> | DeepPartial<T>>): this;
  upsert(key: S, entity: T | Partial<T> | DeepPartial<T>): this;
  upsert(
    keyOrEntities: Array<T | Partial<T> | DeepPartial<T>> | S,
    entity?: T | Partial<T> | DeepPartial<T>
  ): this;
  upsert(
    keyOrEntities: Array<T | Partial<T> | DeepPartial<T>> | S,
    entity?: T | Partial<T> | DeepPartial<T>
  ): this {
    if (entity && isPrimitive(keyOrEntities)) {
      return this.upsertOne(keyOrEntities, entity as any);
    } else {
      return this.upsertMany(keyOrEntities as any[]);
    }
  }

  private upsertOne(key: S, entity: T): this;
  private upsertOne(key: S, entity: Partial<T>): this;
  private upsertOne(key: S, entity: DeepPartial<T>): this;
  private upsertOne(key: S, entity: T | Partial<T> | DeepPartial<T>): this {
    if (this.has(key)) {
      return this.update(key, entity as DeepPartial<T>);
    } else {
      return this.set(key, entity as T);
    }
  }

  private upsertMany(entities: T[] | DeepPartial<T>[]): this {
    if (!this.idGetter) {
      console.warn('IdGetter is not defined');
      return this;
    }
    const [newEntities, keys] = toEntities(entities as T[], this.idGetter);
    this.__keys = new Set([...this.__keys, ...keys]);
    this.__state = deepMerge(this.__state, newEntities);
    return this;
  }

  remove(idOrIds: S | S[]): this;
  remove(callback: (entity: T, key: S) => boolean): this;
  remove(idOrIdsOrCallback: S | S[] | ((entity: T, key: S) => boolean)): this;
  remove(idOrIdsOrCallback: S | S[] | ((entity: T, key: S) => boolean)): this {
    if (!isFunction(idOrIdsOrCallback)) {
      const ids = isArray(idOrIdsOrCallback)
        ? idOrIdsOrCallback
        : [idOrIdsOrCallback];
      this.fromObject(this._filter((_, key) => !ids.includes(key)));
    } else {
      this.fromObject(
        this._filter((entity, key) => !idOrIdsOrCallback(entity, key))
      );
    }
    return this;
  }
}
