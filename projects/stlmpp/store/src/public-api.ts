/*
 * Public API Surface of store
 */

export {
  EntityState,
  StoreOptions,
  EntityMergeFn,
  EntityStoreOptions,
  KeyValue,
  StMapMergeOptions,
  DistinctUntilChangedFn,
  EntityUpdate,
  EntityUpdateWithId,
  EntityPartialUpdate,
  EntityPredicate,
  Entries,
} from './lib/type';
export { StMap } from './lib/map';
export { EntityStore } from './lib/entity/entity-store';
export { EntityQuery } from './lib/entity/entity-query';
export { Store } from './lib/store/store';
export { Query } from './lib/store/query';
export { setError, setLoading, useCache } from './lib/operators';
export { StStoreModule, StStoreModuleConfig } from './lib/st-store.module';
export { StorePersistLocalStorageStrategy, StorePersistStrategy } from './lib/store/store-persist';
