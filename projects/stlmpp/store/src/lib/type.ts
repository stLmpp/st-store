import { StMap } from './map';
import { ID, IdGetterType } from '@stlmpp/utils';

export interface EntityState<T, S extends ID = number, E = any> {
  entities: StMap<T, S>;
  loading: boolean;
  error: E;
  active?: StMap<T, S>;
}

export interface EntityStoreOptions<T, S extends ID = number> {
  name: string;
  idGetter?: IdGetterType<T, S>;
  mergeFn?: EntityMergeFn<T>;
  initialState?: { [K in S]?: T } | T[];
  initialActive?: { [K in S]?: T } | T[];
  cache?: number;
}

export interface StoreOptions<T> {
  name: string;
  initialState?: T;
  cache?: number;
  persist?: string;
  persistSerialize?: <V>(value: V) => string;
  persistDeserialize?: <V>(value: string) => V;
}

export type EntityMergeFn<T = any> = (entityA: T, entityB: T | Partial<T>) => T;

export interface KeyValue<K, V> {
  key: K;
  value: V;
}

export interface StMapMergeOptions {
  upsert?: boolean;
}
