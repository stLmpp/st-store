import { StMap } from './map';
import { IdGetter, OrderByDirection, OrderByType } from 'st-utils';
import { StorePersistStrategy } from './store/store-persist';
import { SchedulerLike } from 'rxjs';

export type EntityIdType = number | string;

export interface EntityState<T extends Record<any, any> = Record<any, any>> {
  [key: string]: any;
  entities: StMap<T>;
  activeKeys: Set<EntityIdType>;
}

export type EntityType<State> = State extends EntityState<infer T> ? T : never;

export type EntityFn<T extends Record<any, any>, R> = (entity: Readonly<T>, key: EntityIdType) => R;
export type EntityUpdate<T extends Record<any, any>> = (entity: Readonly<T>) => T;
export type EntityUpdateWithId<T extends Record<any, any>, R extends Record<any, any> = T> = EntityFn<T, R>;
export type EntityPartialUpdate<T extends Record<any, any>> = EntityUpdate<T> | Partial<T> | T;
export type EntityPredicate<T extends Record<any, any>> = EntityFn<T, boolean>;

export type DistinctUntilChangedFn<T = any> = (entityA: T, entityB: T) => boolean;

export interface EntityStoreOptions<State extends EntityState<T> = any, T extends Record<any, any> = EntityType<State>>
  extends Omit<StoreOptions<any>, 'initialState' | 'persistKey' | 'persistStrategy'> {
  idGetter?: IdGetter<T, keyof T>;
  mergeFn?: EntityMergeFn<T>;
  initialState?: Partial<Omit<State, 'entities' | 'activeKeys'>> & { entities?: T[] | { [id: string]: T } };
  initialActive?: EntityIdType[];
}

export interface StoreOptions<T extends Record<any, any>> {
  name: string;
  initialState: T;
  cache?: number;
  persistKey?: keyof T;
  persistStrategy?: StorePersistStrategy<T>;
}

export interface QueryOptions {
  distinctUntilChanged?: boolean;
}

export type EntityMergeFn<T extends Record<any, any> = Record<any, any>> = (entityA: T, entityB: T | Partial<T>) => T;

export interface KeyValue<K, V> {
  key: K;
  value: V;
}

export interface StMapMergeOptions {
  upsert?: boolean;
}

export type Entries<T = any, K extends keyof T = keyof T> = [K, T[K]][];

export type EntityFilter<T extends Record<any, any>, K extends keyof T = keyof T> =
  | [K, T[K]]
  | ((entity: T, key: EntityIdType) => boolean);
export interface EntityFilterOptions<T extends Record<any, any> = Record<any, any>, K extends keyof T = keyof T> {
  filterBy?: EntityFilter<T, K>;
  orderBy?: OrderByType<T, K>;
  orderByDirection?: OrderByDirection;
}

export interface SimpleChangeCustom<T = any> {
  previousValue: T;
  currentValue: T;
  firstChange: boolean;

  isFirstChange(): boolean;
}

export type SimpleChangesCustom<T extends Record<any, any> = any> = { [K in keyof T]?: SimpleChangeCustom<T[K]> };

export interface StateComponentConfigInput<T extends Record<any, any>, K extends keyof T = keyof T> {
  key: K;
  transformer: (value: T[K]) => any;
}

export interface StateConfig {
  scheduler?: SchedulerLike;
  name?: string;
  useDevCopy?: boolean;
}

export interface StateComponentConfig<T extends Record<any, any>, K extends keyof T = keyof T> extends StateConfig {
  inputs?: Array<K | StateComponentConfigInput<T, K>>;
}
