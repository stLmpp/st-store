import { EntityState, EntityStoreOptions } from '../type';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { StMap } from '../map';
import {
  isArray,
  isFunction,
  isNullOrUndefined,
  isPrimitive,
  isString,
} from 'is-what';
import { devCopy } from '../utils';
import { isDev } from '../env';
import { OnDestroy } from '@angular/core';
import {
  deepMerge,
  DeepPartial,
  getDeep,
  groupBy,
  ID,
  IdGetter,
  removeArray,
  updateArray,
  upsertArray,
} from '@stlmpp/utils';
import { takeUntil } from 'rxjs/operators';

const ST_ENTITY_STORE_DEFAULTS: EntityStoreOptions<any, any> = {
  idGetter: entity => entity.id,
} as any;

export class EntityStore<T, S extends ID = number, E = any>
  implements OnDestroy {
  constructor(options: EntityStoreOptions<T, S> = {} as any) {
    if (options.idGetter) {
      if (isString(options.idGetter) || isArray(options.idGetter)) {
        this.idGetter = e => getDeep(e, options.idGetter as any);
      } else if (isFunction(options.idGetter)) {
        this.idGetter = options.idGetter;
      }
    } else {
      this.idGetter = ST_ENTITY_STORE_DEFAULTS.idGetter as any;
    }
    this.options = { ...(ST_ENTITY_STORE_DEFAULTS as any), ...options };
    this.setInitialState();
    this.listenToChildren();
  }

  type = 'entity';

  private _destroy$ = new Subject();

  private _add$ = new Subject<T>();
  private _update$ = new Subject<T>();
  private _remove$ = new Subject<T[]>();
  private _upsert$ = new Subject<T>();

  add$ = this._add$.asObservable();
  update$ = this._update$.asObservable();
  remove$ = this._remove$.asObservable();
  upsert$ = this._upsert$.asObservable();

  idGetter: IdGetter<T, S>;
  private options: EntityStoreOptions<T, S> = {} as any;

  private __timeout: any;
  private __cache$ = new BehaviorSubject(false);

  private state$: BehaviorSubject<EntityState<T, S, E>>;

  private setInitialState(): void {
    const entities = new StMap<T, S>(this.idGetter);
    const active = new StMap<T, S>(this.idGetter);
    if (this.options.initialState) {
      if (isArray(this.options.initialState)) {
        entities.fromArray(this.options.initialState);
      } else {
        entities.fromObject(this.options.initialState);
      }
    }
    if (this.options.initialActive) {
      if (isArray(this.options.initialActive)) {
        active.fromArray(this.options.initialActive);
      } else {
        active.fromObject(this.options.initialActive);
      }
    }
    this.state$ = new BehaviorSubject<EntityState<T, S, E>>({
      entities,
      active,
      error: null,
      loading: false,
    });
  }

  getState(): EntityState<T, S, E> {
    return this.state$.value;
  }

  selectState(): Observable<EntityState<T, S, E>> {
    return this.state$.asObservable();
  }

  selectCache(): Observable<boolean> {
    return this.__cache$.asObservable();
  }

  hasCache(): boolean {
    return this.options.cache && this.__cache$.value;
  }

  setHasCache(hasCache: boolean): void {
    if (this.options.cache) {
      clearTimeout(this.__timeout);
      this.__cache$.next(hasCache);
      this.__timeout = setTimeout(() => {
        this.setHasCache(false);
      }, this.options.cache);
    }
  }

  private setState(state: EntityState<T, S, E>): void {
    if (isDev) {
      state.entities = state.entities.map(entity => devCopy(entity));
      state.active = state.active.map(active => devCopy(active));
      state.error = devCopy(state.error);
    }
    this.state$.next(state);
  }

  private updateState(
    stateOrCallback:
      | ((state: EntityState<T, S, E>) => EntityState<T, S, E>)
      | Partial<EntityState<T, S, E>>
  ): void {
    const currentState = this.getState();
    const newState = isFunction(stateOrCallback)
      ? stateOrCallback(currentState)
      : stateOrCallback;
    this.setState({ ...currentState, ...newState });
  }

  set(array: T[]): void {
    this.updateState({
      entities: new StMap<T, S>(this.idGetter).fromArray(array),
    });
  }

  add(entityOrEntities: T | T[]): void {
    let entities = isArray(entityOrEntities)
      ? entityOrEntities
      : [entityOrEntities];
    entities = entities.map(entity => {
      const newEntity = this.preAdd(entity);
      this._add$.next(newEntity);
      return newEntity;
    });
    this.updateState(state => {
      return {
        ...state,
        entities: state.entities.merge(entities),
      };
    });
    this.postAdd();
  }

  remove(idOrIds: S | S[]): void;
  remove(callback: (entity: T, key: S) => boolean): void;
  remove(idOrIdsOrCallback: S | S[] | ((entity: T, key: S) => boolean)): void {
    const callback = isFunction(idOrIdsOrCallback)
      ? idOrIdsOrCallback
      : (entity, key) => {
          const ids = isArray(idOrIdsOrCallback)
            ? idOrIdsOrCallback
            : [idOrIdsOrCallback];
          return ids.includes(key);
        };
    const entities = this.getState().entities.filter(callback);
    this.updateState(state => {
      return { ...state, entities: state.entities.remove(idOrIdsOrCallback) };
    });
    const entitiesRemoved = entities.values();
    this.postRemove(entitiesRemoved);
    this._remove$.next(entitiesRemoved);
  }

  update(id: S, partial: DeepPartial<T>): void;
  update(id: S, partial: Partial<T>): void;
  update(id: S, callback: (entity: T) => T): void;
  update(
    predicate: (entity: T, key: S) => boolean,
    partial: DeepPartial<T>
  ): void;
  update(predicate: (entity: T, key: S) => boolean, partial: Partial<T>): void;
  update(
    predicate: (entity: T, key: S) => boolean,
    callback: (entity: T) => T
  ): void;
  update(
    idOrPredicate: S | ((entity: T, key: S) => boolean),
    partialOrCallback: Partial<T> | DeepPartial<T> | ((entity: T) => T)
  ): void {
    const callback = isFunction(idOrPredicate)
      ? idOrPredicate
      : (_, key) => key === idOrPredicate;
    let entities = this.getState().entities.filter(callback).values();
    if (!entities?.length) return;
    const updateCallback = isFunction(partialOrCallback)
      ? partialOrCallback
      : entity => deepMerge(entity, partialOrCallback);
    entities = entities.map(entity => {
      const updated = this.preUpdate(updateCallback(entity));
      this._update$.next(updated);
      return updated;
    });
    this.updateState(state => {
      return {
        ...state,
        entities: state.entities.merge(entities),
      };
    });
    this.postUpdate();
  }

  upsert(entities: Array<T | Partial<T> | DeepPartial<T>>): void;
  upsert(key: S, entity: T | Partial<T> | DeepPartial<T>): void;
  upsert(
    keyOrEntities: Array<T | Partial<T> | DeepPartial<T>> | S,
    entity?: T | Partial<T> | DeepPartial<T>
  ): void {
    const newEntities = this.preUpsert(keyOrEntities, entity);
    this.updateState(state => {
      return {
        ...state,
        entities: state.entities.merge(newEntities),
      };
    });
    this.postUpsert();
  }

  private preUpsert(
    keyOrEntities: Array<T | Partial<T> | DeepPartial<T>> | S,
    entity?: T | Partial<T> | DeepPartial<T>
  ): T[] {
    if (isPrimitive(keyOrEntities)) {
      const entityStored = this.getState().entities.get(keyOrEntities);
      const newEntity = this.preUpdate(deepMerge(entityStored, entity));
      this._upsert$.next(newEntity);
      return [newEntity];
    } else {
      const currentEntities = this.getState().entities;
      return keyOrEntities.reduce((acc, item) => {
        const id = this.idGetter(item as T);
        if (isNullOrUndefined(id)) {
          return acc;
        }
        if (currentEntities.has(id)) {
          const currentEntity = currentEntities.get(id);
          const updated = this.preUpdate(deepMerge(currentEntity, item));
          this._upsert$.next(updated);
          return [...acc, updated];
        } else {
          const newEntity = this.preAdd(item as T);
          this._upsert$.next(newEntity);
          return [...acc, newEntity];
        }
      }, []);
    }
  }

  private formatActive(idOrEntity: S | T | Array<S | T>): StMap<T, S> {
    const currentState = this.getState();
    if (isPrimitive(idOrEntity)) {
      return new StMap<T, S>(this.idGetter).set(
        idOrEntity,
        currentState.entities.find((_, id) => id === idOrEntity)
      );
    } else if (isArray(idOrEntity)) {
      if (idOrEntity.every(isPrimitive)) {
        return currentState.entities.filter((_, id) => idOrEntity.includes(id));
      } else {
        return currentState.entities.filter((_, id) =>
          idOrEntity.map(this.idGetter).includes(id)
        );
      }
    } else {
      const id = this.idGetter(idOrEntity);
      return new StMap<T, S>(this.idGetter).set(
        id,
        currentState.entities.find((_, key) => key === id)
      );
    }
  }

  setActive(idOrEntity: S | T | Array<S | T>): void {
    this.updateState(state => {
      return {
        ...state,
        active: this.formatActive(idOrEntity),
      };
    });
  }

  addActive(idOrEntity: S | T | Array<S | T>): void {
    const formatted = this.formatActive(idOrEntity);
    this.updateState(state => {
      return {
        ...state,
        active: state.active.merge(formatted),
      };
    });
  }

  removeActive(idOrEntity: S | T | Array<S | T>): void {
    const formatted = this.formatActive(idOrEntity).keys();
    this.updateState(state => {
      return {
        ...state,
        active: state.active.remove(formatted),
      };
    });
  }

  toggleActive(idOrEntity: S | T): void {
    const currentState = this.getState();
    const idEntity = isPrimitive(idOrEntity)
      ? idOrEntity
      : this.idGetter(idOrEntity);
    if (currentState.active.has(idEntity)) {
      this.removeActive(idEntity);
    } else {
      this.addActive(idEntity);
    }
  }

  removeActiveEntities(): void {
    this.remove(this.getState().active.keys());
  }

  private updateActive(): void {
    const currentState = this.getState();
    const activeIds = currentState.active.keys();
    this.setActive(activeIds);
  }

  replace(id: S, entity: T): void {
    this.updateState(state => {
      return {
        ...state,
        entities: state.entities.set(id, entity),
      };
    });
    this.updateActive();
  }

  private listenToChildren(): void {
    if (this.options.children?.length) {
      for (const { store: _store, key, relation, reverseRelation } of this
        .options.children) {
        if (_store.type === 'entity') {
          const store = _store as any;
          store.upsert$.pipe(takeUntil(this._destroy$)).subscribe(newEntity => {
            const idEntity = relation(newEntity);
            this.update(idEntity, entity => {
              return {
                ...entity,
                [key]: upsertArray(
                  entity[key as string] ?? [],
                  newEntity,
                  store.idGetter
                ),
              };
            });
          });
          store.update$.pipe(takeUntil(this._destroy$)).subscribe(newEntity => {
            const idEntity = relation(newEntity);
            this.update(idEntity, entity => {
              return {
                ...entity,
                [key]: updateArray(
                  entity[key as string] ?? [],
                  store.idGetter(newEntity),
                  newEntity,
                  store.idGetter
                ),
              };
            });
          });
          store.add$.pipe(takeUntil(this._destroy$)).subscribe(newEntity => {
            const idEntity = relation(newEntity);
            this.update(idEntity, entity => {
              return {
                ...entity,
                [key]: upsertArray(
                  entity[key as string] ?? [],
                  newEntity,
                  store.idGetter
                ),
              };
            });
          });
          store.remove$
            .pipe(takeUntil(this._destroy$))
            .subscribe(removedEntities => {
              const grouped = groupBy(removedEntities, relation);
              for (const [idEntity, entities] of grouped) {
                this.update(idEntity, entity => {
                  return {
                    ...entity,
                    [key]: removeArray(
                      entity[key as string] ?? [],
                      entities.map(store.idGetter) as any[],
                      store.idGetter
                    ),
                  };
                });
              }
            });
        } else if (_store.type === 'simple') {
          _store.update$
            .pipe(takeUntil(this._destroy$))
            .subscribe(newEntity => {
              const idEntity = relation(newEntity);
              this.update(entity => reverseRelation(entity) === idEntity, {
                [key]: newEntity,
              } as any);
            });
        }
      }
    }
  }

  setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  setError(error: E): void {
    this.updateState({ error });
  }

  reset(): void {
    this.setInitialState();
  }

  preAdd(entity: T): T {
    return entity;
  }

  postAdd(): void {
    this.updateActive();
  }

  preUpdate(entity: T): T {
    return entity;
  }

  postUpdate(): void {
    this.updateActive();
  }

  postUpsert(): void {
    this.updateActive();
  }

  postRemove(entitiesRemoved: T[]): void {
    this.updateActive();
  }

  destroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
    this.reset();
  }

  ngOnDestroy(): void {
    this.destroy();
  }
}
