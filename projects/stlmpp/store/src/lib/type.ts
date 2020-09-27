import { StMap } from './map';
import { ID, IdGetterType } from '@stlmpp/utils';

export interface EntityState<T = any, S extends ID = number | string, E = any> {
  entities: StMap<T, S>;
  loading: boolean;
  error: E | null;
  active: StMap<T, S>;
}

export type EntityType<State> = State extends EntityState<infer T> ? T : never;
export type IdType<State> = State extends EntityState<any, infer S> ? S : never;
export type ErrorType<State> = State extends EntityState<any, any, infer E> ? E : never;

export type DistinctUntilChangedFn<T = any> = (entityA: T, entityB: T) => boolean;

export interface EntityStoreOptions<T, S extends ID = number> {
  name: string;
  idGetter: IdGetterType<T, S>;
  mergeFn: EntityMergeFn<T>;
  initialState?: { [K in S]?: T } | T[];
  initialActive?: { [K in S]?: T } | T[];
  cache?: number;
}

export interface StoreOptions<T> {
  name: string;
  initialState: T;
  cache?: number;
  persist?: keyof T;
  persistSerialize: <V>(value: V) => string;
  persistDeserialize: <V>(value: string) => V;
}

export type EntityMergeFn<T = any> = (entityA: T, entityB: T | Partial<T>) => T;

export interface KeyValue<K, V> {
  key: K;
  value: V;
}

export interface StMapMergeOptions {
  upsert?: boolean;
}
