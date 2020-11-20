import { StMap } from './map';
import { ID, IdGetterType, OrderByDirection, OrderByType } from '@stlmpp/utils';
import { StorePersistStrategy } from './store/store-persist';

export interface EntityState<T = any, S extends ID = number, E = any> {
  entities: StMap<T, S>;
  activeKeys: Set<S>;
}

export type EntityType<State> = State extends EntityState<infer T> ? T : never;
export type IdType<State> = State extends EntityState<any, infer S> ? S : never;
export type ErrorType<State> = State extends EntityState<any, any, infer E> ? E : never;

export type EntityUpdate<T> = (entity: Readonly<T>) => T;
export type EntityUpdateWithId<T, S extends ID = number> = (entity: Readonly<T>, key: S) => T;
export type EntityPartialUpdate<T> = EntityUpdate<T> | Partial<T> | T;
export type EntityPredicate<T, S extends ID = number> = (entity: Readonly<T>, key: S) => boolean;

export type DistinctUntilChangedFn<T = any> = (entityA: T, entityB: T) => boolean;

export interface EntityStoreOptions<T, S extends ID = number, E = any>
  extends Omit<StoreOptions<any>, 'initialState' | 'persistKey' | 'persistStrategy'> {
  idGetter?: IdGetterType<T, S>;
  mergeFn?: EntityMergeFn<T>;
  initialState?: { [K in S]?: T } | T[];
  initialActive?: S[];
}

export interface StoreOptions<T> {
  name: string;
  initialState: T;
  cache?: number;
  persistKey?: keyof T;
  persistStrategy?: StorePersistStrategy<T>;
}

export type EntityMergeFn<T = any> = (entityA: T, entityB: T | Partial<T>) => T;

export interface KeyValue<K, V> {
  key: K;
  value: V;
}

export interface StMapMergeOptions {
  upsert?: boolean;
}

export type Entries<T = any, K extends keyof T = keyof T> = [K, T[K]][];

export type EntityFilter<T, S extends ID = number, K extends keyof T = keyof T> =
  | [K, T[K]]
  | ((entity: T, key: S) => boolean);
export interface EntityFilterOptions<T = any, S extends ID = number, E = any> {
  filterBy?: EntityFilter<T, S>;
  orderBy?: OrderByType<T>;
  orderByDirection?: OrderByDirection;
  limit?: number;
}
