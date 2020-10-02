import {
  EntityMergeFn,
  EntityPartialUpdate,
  EntityPredicate,
  EntityState,
  EntityStoreOptions,
  EntityType,
  EntityUpdate,
  EntityUpdateWithId,
  ErrorType,
  IdType,
} from '../type';
import { BehaviorSubject, Observable } from 'rxjs';
import { StMap } from '../map';
import { isArray, isFunction, isNil } from 'lodash-es';
import { devCopy } from '../utils';
import { environment } from '../environment';
import { ID, IdGetter, idGetterFactory, isID } from '@stlmpp/utils';

export class EntityStore<
  State extends EntityState<T, S, E> = any,
  T = EntityType<State>,
  S extends ID = IdType<State>,
  E = ErrorType<State>
> {
  constructor(private options: EntityStoreOptions<T, S>) {
    this.idGetter = idGetterFactory(options.idGetter);
    this.merger = options.mergeFn ?? ((entityA, entityB) => ({ ...entityA, ...entityB }));
    this.setInitialState();
  }

  idGetter: IdGetter<T, S>;
  merger: EntityMergeFn<T>;

  private __timeout: any;
  private __cache$ = new BehaviorSubject(false);

  private state$!: BehaviorSubject<State>;

  private createMap(): State['entities'] {
    return new StMap(this.idGetter, this.merger);
  }

  private createSet(values: S[] = []): State['activeKeys'] {
    return new Set(values);
  }

  private setInitialState(): void {
    const entities = this.createMap();
    let activeKeys = this.createSet();
    if (this.options.initialState) {
      if (isArray(this.options.initialState)) {
        entities.fromArray(this.options.initialState);
      } else {
        entities.fromObject(this.options.initialState);
      }
    }
    if (this.options.initialActive && this.options.initialState) {
      activeKeys = this.createSet(this.options.initialActive.filter(key => entities.has(key)));
    }
    const state: EntityState<T, S, E> = {
      entities,
      loading: false,
      error: null,
      activeKeys,
    };
    this.state$ = new BehaviorSubject<State>(state as any);
  }

  getState(): State {
    return this.state$.value;
  }

  selectState(): Observable<State> {
    return this.state$.asObservable();
  }

  selectCache(): Observable<boolean> {
    return this.__cache$.asObservable();
  }

  hasCache(): boolean {
    return !!this.options.cache && this.__cache$.value;
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

  private setState(state: State): void {
    if (environment.isDev) {
      state = {
        ...state,
        entities: state.entities.map(entity => devCopy(entity)),
        error: devCopy(state.error),
        activeKeys: this.createSet([...state.activeKeys]),
      };
    }
    this.state$.next(state);
  }

  updateState(stateOrCallback: EntityPartialUpdate<State>): void {
    const currentState = this.getState();
    const newState = isFunction(stateOrCallback) ? stateOrCallback(currentState) : stateOrCallback;
    this.setState({ ...currentState, ...newState });
  }

  set(array: T[]): void {
    array = array.map(entry => this.preAdd(entry));
    this.updateState(state => ({ ...state, entities: state.entities.fromArray(array) }));
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
        entities: state.entities.set(this.idGetter(newEntity), newEntity),
      };
    });
  }

  remove(id: S): void;
  remove(ids: S[]): void;
  remove(callback: EntityPredicate<T, S>): void;
  remove(idOrIdsOrCallback: S | S[] | EntityPredicate<T, S>): void {
    const callback: EntityPredicate<T, S> = isFunction(idOrIdsOrCallback)
      ? (entity, key) => !idOrIdsOrCallback(entity, key)
      : isArray(idOrIdsOrCallback)
      ? (_, key) => idOrIdsOrCallback.includes(key)
      : (_, key) => key === idOrIdsOrCallback;
    const entities = this.getState().entities.filter(callback);
    this.updateState(state => {
      return {
        ...state,
        entities: state.entities.remove(idOrIdsOrCallback),
        activeKeys: this.createSet([...state.activeKeys].filter(key => !entities.has(key))),
      };
    });
    const entitiesRemoved = entities.values;
    this.postRemove(entitiesRemoved);
  }

  update(id: S, partial: Partial<T>): void;
  update(id: S, callback: EntityUpdate<T>): void;
  update(predicate: EntityPredicate<T, S>, partial: Partial<T>): void;
  update(predicate: EntityPredicate<T, S>, callback: EntityUpdate<T>): void;
  update(idOrPredicate: S | EntityPredicate<T, S>, partialOrCallback: EntityPartialUpdate<T>): void {
    const updateCallback = isFunction(partialOrCallback)
      ? partialOrCallback
      : (entity: T) => this.merger(entity, partialOrCallback);
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
      const entitiesMap = this.getState().entities.filter(idOrPredicate);
      if (!entitiesMap.length) {
        return;
      }
      let entities = entitiesMap.values;
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
        const entityStored = currentEntities.get(keyOrEntities)!;
        const newEntity = this.preUpdate(this.merger(entityStored, entity as T));
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
          const currentEntity = currentEntities.get(id)!;
          const updated = this.preUpdate(this.merger(currentEntity, item));
          return [...acc, updated];
        } else {
          const newEntity = this.preAdd(item as T);
          return [...acc, newEntity];
        }
      }, [] as T[]);
    }
  }

  private formatActive(idOrEntity: S | T | Array<S | T>): Set<S> {
    if (isID(idOrEntity)) {
      return this.createSet([idOrEntity]);
    } else if (isArray(idOrEntity)) {
      return idOrEntity.reduce((newSet, ioe) => {
        if (isID(ioe)) {
          newSet.add(ioe);
        } else {
          const key = this.idGetter(ioe);
          newSet.add(key);
        }
        return newSet;
      }, this.createSet());
    } else {
      const id = this.idGetter(idOrEntity);
      return this.createSet([id]);
    }
  }

  setActive(idOrEntity: S | T | Array<S | T>): void {
    this.updateState(state => {
      return {
        ...state,
        activeKeys: this.formatActive(idOrEntity),
      };
    });
  }

  addActive(idOrEntity: S | T | Array<S | T>): void {
    const formatted = this.formatActive(idOrEntity);
    this.updateState(state => {
      return {
        ...state,
        activeKeys: this.createSet([...state.activeKeys, ...formatted]),
      };
    });
  }

  removeActive(idOrEntity: S | T | Array<S | T>): void {
    const formatted = this.formatActive(idOrEntity);
    this.updateState(state => {
      return {
        ...state,
        activeKeys: this.createSet([...state.activeKeys].filter(key => !formatted.has(key))),
      };
    });
  }

  toggleActive(idOrEntity: S | T): void {
    const currentState = this.getState();
    const idEntity = isID(idOrEntity) ? idOrEntity : this.idGetter(idOrEntity);
    if (currentState.activeKeys.has(idEntity)) {
      this.removeActive(idEntity);
    } else {
      this.addActive(idEntity);
    }
  }

  removeActiveEntities(): void {
    this.remove([...this.getState().activeKeys]);
  }

  replace(id: S, entity: T): void {
    this.updateState(state => {
      return {
        ...state,
        entities: state.entities.set(id, entity),
      };
    });
  }

  map(callback: EntityUpdateWithId<T, S>): void {
    this.updateState(state => {
      return {
        ...state,
        entities: state.entities.map(callback),
      };
    });
  }

  setLoading(loading: boolean): void {
    this.updateState(state => ({ ...state, loading }));
  }

  setError(error: E | null): void {
    this.updateState(state => ({ ...state, error }));
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

  postUpdate(): void {}

  postUpsert(): void {}

  postRemove(entitiesRemoved: T[]): void {}
}
