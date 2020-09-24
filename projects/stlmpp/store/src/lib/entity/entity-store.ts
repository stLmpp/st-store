import { EntityState, EntityStoreOptions } from '../type';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { StMap } from '../map';
import { isArray, isFunction, isNil } from 'lodash-es';
import { devCopy } from '../utils';
import { isDev } from '../env';
import { ID, IdGetter, idGetterFactory, isID } from '@stlmpp/utils';

const ST_ENTITY_STORE_DEFAULTS: EntityStoreOptions<any, any> = {
  idGetter: entity => entity.id,
  mergeFn: (entityA, entityB) => ({ ...entityA, ...entityB }),
  name: '',
};

export class EntityStore<T, S extends ID = number, E = any> {
  constructor(options: EntityStoreOptions<T, S> = {} as any) {
    this.idGetter = idGetterFactory(options.idGetter);
    this.options = { ...(ST_ENTITY_STORE_DEFAULTS as any), ...options };
    this.setInitialState();
  }

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
    if (isDev()) {
      state.entities = state.entities.map(entity => devCopy(entity));
      state.active = state.active.map(active => devCopy(active));
      state.error = devCopy(state.error);
    }
    this.state$.next(state);
  }

  private updateState(
    stateOrCallback: ((state: EntityState<T, S, E>) => EntityState<T, S, E>) | Partial<EntityState<T, S, E>>
  ): void {
    const currentState = this.getState();
    const newState = isFunction(stateOrCallback) ? stateOrCallback(currentState) : stateOrCallback;
    this.setState({ ...currentState, ...newState });
  }

  set(array: T[]): void {
    this.updateState({
      entities: new StMap<T, S>(this.idGetter).fromArray(array),
    });
  }

  add(entity: T): void;
  add(entities: T[]): void;
  add(entityOrEntities: T | T[]): void {
    if (isArray(entityOrEntities)) {
      this.addMany(entityOrEntities);
    } else {
      this.addOne(entityOrEntities);
    }
    this.postAdd();
  }

  private addMany(entities: T[]): void {
    const newEntities = entities.map(entity => {
      entity = this.preAdd(entity);
      return entity;
    });
    this.updateState(state => {
      return {
        ...state,
        entities: state.entities.setMany(newEntities),
      };
    });
  }

  private addOne(entity: T): void {
    const newEntity = this.preAdd(entity);
    this.updateState(state => {
      return {
        ...state,
        entities: state.entities.set(this.idGetter(entity), entity),
      };
    });
  }

  remove(id: S): void;
  remove(ids: S[]): void;
  remove(callback: (entity: T, key: S) => boolean): void;
  remove(idOrIdsOrCallback: S | S[] | ((entity: T, key: S) => boolean)): void {
    const callback = isFunction(idOrIdsOrCallback)
      ? (entity, key) => !idOrIdsOrCallback(entity, key)
      : isArray(idOrIdsOrCallback)
      ? (_, key) => idOrIdsOrCallback.includes(key)
      : (_, key) => key === idOrIdsOrCallback;
    const entities = this.getState().entities.filter(callback);
    this.updateState(state => {
      return { ...state, entities: state.entities.remove(idOrIdsOrCallback) };
    });
    const entitiesRemoved = entities.values;
    this.postRemove(entitiesRemoved);
  }

  update(id: S, partial: Partial<T>): void;
  update(id: S, callback: (entity: T) => T): void;
  update(predicate: (entity: T, key: S) => boolean, partial: Partial<T>): void;
  update(predicate: (entity: T, key: S) => boolean, callback: (entity: T) => T): void;
  update(
    idOrPredicate: S | ((entity: T, key: S) => boolean),
    partialOrCallback: Partial<T> | ((entity: T) => T)
  ): void {
    const updateCallback = isFunction(partialOrCallback)
      ? partialOrCallback
      : entity => this.options.mergeFn(entity, partialOrCallback);
    if (isID(idOrPredicate)) {
      const entity = this.getState().entities.get(idOrPredicate);
      if (!entity) {
        return;
      }
      const newEntity = this.preUpdate(updateCallback(entity));
      this.updateState(state => {
        return { ...state, entities: state.entities.update(idOrPredicate, newEntity) };
      });
    } else {
      let entities = this.getState().entities.filter(idOrPredicate).values;
      if (!entities?.length) return;
      entities = entities.map(entity => {
        return this.preUpdate(updateCallback(entity));
      });
      this.updateState(state => {
        return {
          ...state,
          entities: state.entities.merge(entities),
        };
      });
    }
    this.postUpdate();
  }

  upsert(entities: Array<T | Partial<T>>): void;
  upsert(key: S, entity: T | Partial<T>): void;
  upsert(keyOrEntities: Array<T | Partial<T>> | S, entity?: T | Partial<T>): void {
    const newEntities = this.preUpsert(keyOrEntities, entity);
    this.updateState(state => {
      return {
        ...state,
        entities: state.entities.upsert(newEntities),
      };
    });
    this.postUpsert();
  }

  private preUpsert(keyOrEntities: Array<T | Partial<T>> | S, entity?: T | Partial<T>): T[] {
    const currentEntities = this.getState().entities;
    if (isID(keyOrEntities)) {
      if (currentEntities.has(keyOrEntities)) {
        const entityStored = this.getState().entities.get(keyOrEntities);
        const newEntity = this.preUpdate(this.options.mergeFn(entityStored, entity));
        return [newEntity];
      } else {
        const newEntity = this.preAdd(entity as T);
        return [newEntity];
      }
    } else {
      return keyOrEntities.reduce((acc, item) => {
        const id = this.idGetter(item as T);
        if (isNil(id)) {
          return acc;
        }
        if (currentEntities.has(id)) {
          const currentEntity = currentEntities.get(id);
          const updated = this.preUpdate(this.options.mergeFn(currentEntity, item));
          return [...acc, updated];
        } else {
          const newEntity = this.preAdd(item as T);
          return [...acc, newEntity];
        }
      }, []);
    }
  }

  private formatActive(idOrEntity: S | T | Array<S | T>): StMap<T, S> {
    const currentEntities = this.getState().entities;
    if (isID(idOrEntity)) {
      return new StMap<T, S>(this.idGetter).set(idOrEntity, currentEntities.get(idOrEntity));
    } else if (isArray(idOrEntity)) {
      return idOrEntity.reduce((stMap, ioe) => {
        if (isID(ioe)) {
          stMap.set(ioe, currentEntities.get(ioe));
        } else {
          const key = this.idGetter(ioe);
          stMap.set(key, currentEntities.get(key));
        }
        return stMap;
      }, new StMap<T, S>(this.idGetter));
    } else {
      const id = this.idGetter(idOrEntity);
      return new StMap<T, S>(this.idGetter).set(id, currentEntities.get(id));
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
        active: formatted,
      };
    });
  }

  removeActive(idOrEntity: S | T | Array<S | T>): void {
    const formatted = this.formatActive(idOrEntity).keysArray;
    this.updateState(state => {
      return {
        ...state,
        active: state.active.remove(formatted),
      };
    });
  }

  toggleActive(idOrEntity: S | T): void {
    const currentState = this.getState();
    const idEntity = isID(idOrEntity) ? idOrEntity : this.idGetter(idOrEntity);
    if (currentState.active.has(idEntity)) {
      this.removeActive(idEntity);
    } else {
      this.addActive(idEntity);
    }
  }

  removeActiveEntities(): void {
    this.remove(this.getState().active.keysArray);
  }

  private updateActive(): void {
    const currentState = this.getState();
    const activeIds = currentState.active.keysArray;
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

  map(callback: (entity: T, key: S) => T): void {
    this.updateState(state => {
      return {
        ...state,
        entities: state.entities.map(callback),
      };
    });
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

  postAdd(): void {}

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
    this.removeActive(entitiesRemoved);
  }
}
