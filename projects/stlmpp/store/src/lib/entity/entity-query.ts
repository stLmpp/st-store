import { EntityStore } from './entity-store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, pluck } from 'rxjs/operators';
import { StMap } from '../map';
import { isArray, isEqual, isFunction } from 'lodash-es';
import { ID } from '@stlmpp/utils';

export class EntityQuery<T, S extends ID = number, E = any> {
  constructor(private __store: EntityStore<T, S, E>) {}

  private __entities$ = this.__store.selectState().pipe(pluck('entities'));
  private get __getEntities(): StMap<T, S> {
    return this.__store.getState().entities;
  }
  private get __getKeys(): Set<S> {
    return this.__getEntities.keys;
  }
  private get __getActive(): StMap<T, S> {
    return this.__store.getState().active;
  }

  all$: Observable<T[]> = this.__entities$.pipe(map(entities => entities.values));
  active$: Observable<T[]> = this.__store.selectState().pipe(
    pluck('active'),
    map(active => active.values),
    distinctUntilChanged(isEqual)
  );

  activeId$: Observable<S[]> = this.__store.selectState().pipe(
    pluck('active'),
    map(active => active.keysArray),
    distinctUntilChanged(isEqual)
  );

  loading$ = this.__store.selectState().pipe(pluck('loading'));
  error$ = this.__store.selectState().pipe(pluck('error'));
  hasCache$ = this.__store.selectCache();

  getAll(): T[] {
    return this.__getEntities.values;
  }

  getActive(): T[] {
    return this.__getActive.values;
  }

  getLoading(): boolean {
    return this.__store.getState().loading;
  }

  getError(): E {
    return this.__store.getState().error;
  }

  getHasCache(): boolean {
    return this.__store.hasCache();
  }

  exists(id: S): boolean;
  exists(ids: S[]): boolean;
  exists(callback: (entity: T, key: S) => boolean): boolean;
  exists(idOrIdsOrCallback: S | S[] | ((entity: T, key: S) => boolean)): boolean {
    const entities = this.__getEntities;
    if (isFunction(idOrIdsOrCallback)) {
      return entities.some(idOrIdsOrCallback);
    } else if (isArray(idOrIdsOrCallback)) {
      return idOrIdsOrCallback.some(id => entities.has(id));
    } else {
      return entities.has(idOrIdsOrCallback);
    }
  }

  hasActive(): boolean {
    return !!this.__getActive.length;
  }

  selectEntity(id: S): Observable<T>;
  selectEntity(callback: (entity: T, key: S) => boolean): Observable<T>;
  selectEntity<K extends keyof T>(
    idOrCallback: S | ((entity: T, key: S) => boolean),
    property: K
  ): Observable<T[K]>;
  selectEntity<K extends keyof T>(
    idOrCallback: S | ((entity: T, key: S) => boolean),
    property?: K
  ): Observable<T | T[K]> {
    let entity$: Observable<T | T[K]>;
    if (isFunction(idOrCallback)) {
      entity$ = this.__entities$.pipe(map(entities => entities.find(idOrCallback)));
    } else {
      entity$ = this.__entities$.pipe(map(entities => entities.get(idOrCallback)));
    }
    if (property) {
      entity$ = entity$.pipe(pluck(property as string));
    }
    return entity$.pipe(distinctUntilChanged(isEqual));
  }

  getEntity(key: S): T;
  getEntity<K extends keyof T>(key: S, property: K): T[K];
  getEntity<K extends keyof T>(key: S, property?: K): T | T[K] {
    const entity = this.__getEntities.get(key);
    return property ? entity?.[property] : entity;
  }

  selectMany(callback: (entity: T, key: S) => boolean): Observable<T[]>;
  selectMany(keys: S[]): Observable<T[]>;
  selectMany(keysOrCallback: S[] | ((entity: T, key: S) => boolean)): Observable<T[]> {
    const callback = isFunction(keysOrCallback) ? keysOrCallback : (_, key) => keysOrCallback.includes(key);
    return this.__entities$.pipe(
      map(entities => entities.filter(callback).values),
      distinctUntilChanged(isEqual)
    );
  }
}
