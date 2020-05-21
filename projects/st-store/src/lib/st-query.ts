import { ID } from './type';
import { StStore } from './st-store';
import { Observable } from 'rxjs';
import { distinctUntilChanged, map, pluck } from 'rxjs/operators';
import { StMap } from './map';
import { isArray, isFunction } from 'is-what';
import { devCopy, devCopyOperator } from './utils';
import { isEqual } from 'lodash';

export class StQuery<T, S extends ID = number, E = any> {
  constructor(private store: StStore<T, S, E>) {}

  private __entities$ = this.store.selectState().pipe(pluck('entities'));
  private get __getEntities(): StMap<T, S> {
    return this.store.getState().entities;
  }
  private get __getActive(): StMap<T, S> {
    return this.store.getState().active;
  }

  all$: Observable<T[]> = this.__entities$.pipe(
    map(entities => entities.values()),
    devCopyOperator()
  );
  active$: Observable<T[]> = this.store.selectState().pipe(
    pluck('active'),
    map(active => active.values()),
    distinctUntilChanged((valueA, valueB) => {
      return isEqual(valueA, valueB);
    }),
    devCopyOperator()
  );
  activeId$: Observable<S[]> = this.active$.pipe(
    map(active => active.map(this.store.idGetter))
  );

  loading$ = this.store.selectState().pipe(pluck('loading'));
  error$ = this.store.selectState().pipe(pluck('error'));
  hasCache$ = this.store.cache$.asObservable();

  getAll(): T[] {
    return devCopy(this.__getEntities.values());
  }

  getActive(): T[] {
    return devCopy(this.__getActive.values());
  }

  getLoading(): boolean {
    return this.store.getState().loading;
  }

  getError(): E {
    return this.store.getState().error;
  }

  getHasCache(): boolean {
    return this.store.hasCache();
  }

  exists(id: S): boolean;
  exists(ids: S[]): boolean;
  exists(callback: (entity: T, key: S) => boolean): boolean;
  exists(
    idOrIdsOrCallback: S | S[] | ((entity: T, key: S) => boolean)
  ): boolean {
    const entities = this.__getEntities;
    if (isFunction(idOrIdsOrCallback)) {
      return !!entities.find(idOrIdsOrCallback);
    } else if (isArray(idOrIdsOrCallback)) {
      return !!entities.find((_, key) => idOrIdsOrCallback.includes(key));
    } else {
      return entities.has(idOrIdsOrCallback);
    }
  }

  hasActive(): boolean {
    return !!this.__getActive.length;
  }

  selectEntity(id: S): Observable<T>;
  selectEntity(callback: (entity: T, key: S) => boolean): Observable<T>;
  selectEntity(
    idOrCallback: S | ((entity: T, key: S) => boolean),
    property: keyof T
  ): Observable<T[keyof T]>;
  selectEntity(
    idOrCallback: S | ((entity: T, key: S) => boolean),
    property?: keyof T
  ): Observable<T | T[keyof T]> {
    let entity$: Observable<T | T[keyof T]>;
    if (isFunction(idOrCallback)) {
      entity$ = this.__entities$.pipe(
        map(entities => entities.find(idOrCallback))
      );
    } else {
      entity$ = this.__entities$.pipe(
        map(entities => entities.get(idOrCallback))
      );
    }
    if (property) {
      entity$ = entity$.pipe(pluck(property as string));
    }
    return entity$.pipe(distinctUntilChanged(), devCopyOperator());
  }

  getEntity(id: S): T;
  getEntity(id: S, property: keyof T): T[keyof T];
  getEntity(id: S, property?: keyof T): T | T[keyof T] {
    let entity = this.__getEntities.get(id);
    entity = devCopy(entity);
    return property ? entity?.[property] : entity;
  }

  selectMany(ids: S[]): Observable<T[]> {
    return this.__entities$.pipe(
      map(entities => entities.filter((_, id) => ids.includes(id))),
      map(entities => entities.values()),
      devCopyOperator()
    );
  }
}
