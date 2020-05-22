import { StMap } from './map';

export type ID = string | number;
export type IdGetter<T, S = number> = (entity: T) => S;

export interface EntityState<T, S extends ID = number, E = any> {
  entities: StMap<T, S>;
  loading: boolean;
  error: E;
  active?: StMap<T, S>;
}

export interface EntityStoreOptions<T, S extends ID = number> {
  name: string;
  idGetter?: IdGetter<T, S> | string | string[];
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

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U2>
    ? ReadonlyArray<DeepPartial<U2>>
    : DeepPartial<T[P]>;
};

export interface KeyValue<K, V> {
  key: K;
  value: V;
}
