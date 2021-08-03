/*
 * Public API Surface of store
 */

/** @internal */
declare global {
  const ngDevMode: any;
}

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
  EntityFilter,
  EntityFilterOptions,
  EntityIdType,
  StateConfig,
  StateComponentConfig,
  StateComponentConfigInput,
  QueryOptions,
  SimpleChangeCustom,
  SimpleChangesCustom,
  EntityFn,
  EntityType,
} from './lib/type';
export { StMap, StMapView } from './lib/map';
export { EntityStore } from './lib/entity/entity-store';
export { EntityQuery } from './lib/entity/entity-query';
export { Store } from './lib/store/store';
export { Query } from './lib/store/query';
export { StorePersistLocalStorageStrategy, StorePersistStrategy } from './lib/store/store-persist';
export { setLoading } from './lib/operators/set-loading';
export { setError } from './lib/operators/set-error';
export { useCache } from './lib/operators/use-cache';
export { useEntityCache } from './lib/operators/use-entity-cache';
export { distinctUntilKeysChanged } from './lib/operators/distinct-until-keys-changed';
export { State } from './lib/state/state';
export { LocalState } from './lib/state/local-state';
export { StateService } from './lib/state/state.service';
