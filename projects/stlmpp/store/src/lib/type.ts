import { StMap } from './map';
import { IdGetter, OrderByDirection, OrderByType } from 'st-utils';
import { StorePersistStrategy } from './store/store-persist';
import { SchedulerLike } from 'rxjs';

export type EntityIdType = number | string;

export interface EntityState<T extends Record<any, any> = Record<any, any>> {
  [key: string]: any;

  /**
   * @description entities of a store
   */
  entities: StMap<T>;
  /**
   * @description active keys of a store
   */
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
  /**
   * @description function used to get the unique id of the object {@link IdGetter}
   */
  idGetter?: IdGetter<T, keyof T>;
  /**
   * @description function used to merge the objects when updating
   */
  mergeFn?: EntityMergeFn<T>;
  /**
   * @description initial state of a store
   */
  initialState?: Partial<Omit<State, 'entities' | 'activeKeys'>> & { entities?: T[] | Record<string, T> };
  /**
   * @description initial active items of a store
   */
  initialActive?: EntityIdType[];
}

export interface StoreOptions<T extends Record<any, any>> {
  /**
   * @description name of a store
   */
  name: string;
  /**
   * @description initial state of a store
   */
  initialState: T;
  /**
   * @description cache timeout
   */
  cache?: number;
  /**
   * @description key used to find/persist the value, is used in the {@see StorePersistStrategy}
   */
  persistKey?: keyof T;
  /**
   * @description strategy used when persisting data in a store
   */
  persistStrategy?: StorePersistStrategy<T>;
}

export interface QueryOptions {
  /**
   * @description use distinctUntilChanged operator in the query observables
   */
  distinctUntilChanged?: boolean;
}

export interface EntityQueryOptions<T extends Record<any, any>> {
  /**
   * @description use distinctUntilChanged operator in the {@link EntityQuery#selectEntity}
   */
  distinctUntilChangedEntity?: boolean;
  /**
   * @description only used when {@link EntityQueryOptions#distinctUntilChanged} is set to true, in the {@link EntityQuery#selectEntity}
   */
  distinctUntilChangedEntityFn?: DistinctUntilChangedFn<T | undefined>;
}

export type EntityMergeFn<T extends Record<any, any> = Record<any, any>> = (entityA: T, entityB: T | Partial<T>) => T;

export interface KeyValue<K, V> {
  key: K;
  value: V;
}

export interface StMapMergeOptions {
  /**
   * @description when using the {@link StMap#merge}, this option will be used to allow upsertting items.
   * <br> If set to true, works the same as {@link StMap#upsert}
   */
  upsert?: boolean;
}

export type Entries<T = any, K extends keyof T = keyof T> = [K, T[K]][];

export type EntityFilter<T extends Record<any, any>, K extends keyof T = keyof T> =
  | [K, T[K]]
  | ((entity: T, key: EntityIdType) => boolean);
export interface EntityFilterOptions<T extends Record<any, any> = Record<any, any>, K extends keyof T = keyof T> {
  /**
   * @description used to filter the entities
   */
  filterBy?: EntityFilter<T, K>;
  /**
   * @description used to order the entities
   */
  orderBy?: OrderByType<T, K>;
  /**
   * @description used with {@link EntityFilterOptions#orderBy}
   */
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
  /**
   * @description use an scheduler to update the state
   * @default {@link https://rxjs.dev/api/index/const/queueScheduler}
   */
  scheduler?: SchedulerLike;
  /**
   * @description name of a state
   */
  name?: string;
  /**
   * @description if set to true, it will deep copy and deep freeze your state in development mode
   */
  useDevCopy?: boolean;
}

export interface StateComponentConfig<T extends Record<any, any>, K extends keyof T = keyof T> extends StateConfig {
  /**
   * @description inputs to synchronize with the state
   */
  inputs?: Array<K | StateComponentConfigInput<T, K>>;
}
