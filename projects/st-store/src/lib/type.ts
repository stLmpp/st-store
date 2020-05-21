import { StMap } from './map';

export type ID = string | number;
export type IdGetter<T, S = number> = (entity: T) => S;

export interface EntityState<T, S extends ID = number, E = any> {
  entities: StMap<T, S>;
  loading: boolean;
  error: E;
  active?: StMap<T, S>;
}

export interface StStoreOptions<T, S extends ID = number> {
  idGetter?: IdGetter<T, S> | string | string[];
  initialState?: { [K in S]?: T } | T[];
  initialActive?: { [K in S]?: T } | T[];
  cache?: number;
}

export type DeepPartial<T> = T extends (...args: unknown[]) => unknown
  ? T
  : T extends Array<infer U>
  ? DeepPartialArray<U>
  : T extends object
  ? DeepPartialObject<T>
  : T | undefined;
export interface DeepPartialArray<T> extends Array<DeepPartial<T>> {}
export type DeepPartialObject<T> = { [P in keyof T]?: DeepPartial<T[P]> };
