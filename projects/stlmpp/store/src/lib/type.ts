import { StMap } from './map';
import { EntityStore } from './entity/entity-store';
import { Store } from './store/store';
import { ID, IdGetter } from '@stlmpp/utils';

export interface EntityState<T, S extends ID = number, E = any> {
  entities: StMap<T, S>;
  loading: boolean;
  error: E;
  active?: StMap<T, S>;
}

export interface EntityStoreChild<T> {
  store: EntityStore<any> | Store<any>;
  relation: (relation: any) => any;
  reverseRelation?: (entity: T) => any;
  key: keyof T;
}

export interface EntityStoreOptions<T, S extends ID = number> {
  name: string;
  idGetter?: IdGetter<T, S> | string | string[];
  initialState?: { [K in S]?: T } | T[];
  initialActive?: { [K in S]?: T } | T[];
  childs?: EntityStoreChild<T>[];
  cache?: number;
}

export interface StoreOptions<T> {
  name: string;
  initialState?: T;
  cache?: number;
  persist?: string;
  persistSerialize?: <V>(value: V) => string;
  persistDeserialize?: <V>(value: string) => V;
  childs?: EntityStoreChild<T>[];
}

export interface KeyValue<K, V> {
  key: K;
  value: V;
}
