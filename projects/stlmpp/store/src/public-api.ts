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
} from './lib/type';
export { StMap } from './lib/map';
export { EntityStore } from './lib/entity/entity-store';
export { EntityQuery } from './lib/entity/entity-query';
export { Store } from './lib/store/store';
export { Query } from './lib/store/query';
export { setError, setLoading, useCache } from './lib/operators';
export { enableProd } from './lib/env';
