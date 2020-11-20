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
import { StMap } from '../map';
import { ID, IdGetter, idGetterFactory, isArray, isFunction, isID, isNil } from '@stlmpp/utils';
import { devCopy } from '../util';
import { environment } from '../environment';
import { Store } from '../store/store';

export class EntityStore<
  State extends EntityState<T, S, E> = any,
  T = EntityType<State>,
  S extends ID = IdType<State>,
  E = ErrorType<State>
> extends Store<State> {
  constructor(private options: EntityStoreOptions<T, S>) {
    super({ ...options, initialState: {} as any });
    this.__useDevCopy = false;
    this.idGetter = idGetterFactory(options.idGetter);
    this.merger = options.mergeFn ?? ((entityA, entityB) => ({ ...entityA, ...entityB }));
    const initialState = this.getInitialState();
    this.updateInitialState(initialState);
    this.update(initialState);
  }

  readonly idGetter: IdGetter<T, S>;
  readonly merger: EntityMergeFn<T>;

  private createMap(): State['entities'] {
    return new StMap(this.idGetter, this.merger);
  }

  private createSet(values: S[] = []): State['activeKeys'] {
    return new Set(values);
  }

  private getInitialState(): State {
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
    return {
      entities,
      loading: false,
      error: null,
      activeKeys,
    } as any;
  }

  update(partial: Partial<State>): void;
  update(state: State): void;
  update(callback: (state: State) => State): void;
  update(state: State | Partial<State> | ((state: State) => State)): void {
    const callback = isFunction(state) ? state : (oldState: State) => ({ ...oldState, ...state });
    super.update(oldState => {
      let newState = callback(oldState);
      if (environment.isDev) {
        newState = {
          ...newState,
          entities: newState.entities.map(entity => devCopy(entity)),
          activeKeys: this.createSet([...newState.activeKeys]),
        } as any;
      }
      return newState;
    });
  }

  setEntities(array: T[]): void {
    array = array.map(entry => this.preAddEntity(entry));
    this.update(state => ({ ...state, entities: state.entities.fromArray(array) }));
  }

  add(entity: T): void;
  add(entities: T[]): void;
  add(entityOrEntities: T | T[]): void {
    if (isArray(entityOrEntities)) {
      this.addMany(entityOrEntities);
    } else {
      this.addOne(entityOrEntities);
    }
    this.postAddEntity();
  }

  private addMany(entities: T[]): void {
    const newEntities = entities.map(entity => {
      entity = this.preAddEntity(entity);
      return entity;
    });
    this.update(state => {
      return {
        ...state,
        entities: state.entities.setMany(newEntities),
      };
    });
  }

  private addOne(entity: T): void {
    const newEntity = this.preAddEntity(entity);
    this.update(state => {
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
    this.update(state => {
      return {
        ...state,
        entities: state.entities.remove(idOrIdsOrCallback),
        activeKeys: this.createSet([...state.activeKeys].filter(key => !entities.has(key))),
      };
    });
    const entitiesRemoved = entities.values;
    this.postRemoveEntity(entitiesRemoved);
  }

  updateEntity(id: S, partial: Partial<T>): void;
  updateEntity(id: S, callback: EntityUpdate<T>): void;
  updateEntity(predicate: EntityPredicate<T, S>, partial: Partial<T>): void;
  updateEntity(predicate: EntityPredicate<T, S>, callback: EntityUpdate<T>): void;
  updateEntity(idOrPredicate: S | EntityPredicate<T, S>, partialOrCallback: EntityPartialUpdate<T>): void {
    const updateCallback = isFunction(partialOrCallback)
      ? partialOrCallback
      : (entity: T) => this.merger(entity, partialOrCallback);
    if (isID(idOrPredicate)) {
      const entity = this.getState().entities.get(idOrPredicate);
      if (!entity) {
        return;
      }
      const newEntity = this.preUpdateEntity(updateCallback(entity));
      this.update(state => {
        return { ...state, entities: state.entities.update(idOrPredicate, newEntity) };
      });
    } else {
      const entitiesMap = this.getState().entities.filter(idOrPredicate);
      if (!entitiesMap.length) {
        return;
      }
      let entities = entitiesMap.values;
      entities = entities.map(entity => {
        return this.preUpdateEntity(updateCallback(entity));
      });
      this.update(state => {
        return {
          ...state,
          entities: state.entities.merge(entities),
        };
      });
    }
    this.postUpdateEntity();
  }

  upsert(entities: Array<T | Partial<T>>): void;
  upsert(key: S, entity: T | Partial<T>): void;
  upsert(keyOrEntities: Array<T | Partial<T>> | S, entity?: T | Partial<T>): void {
    const newEntities = this.preUpsert(keyOrEntities, entity);
    this.update(state => {
      return {
        ...state,
        entities: state.entities.upsert(newEntities),
      };
    });
    this.postUpsertEntity();
  }

  private preUpsert(keyOrEntities: Array<T | Partial<T>> | S, entity?: T | Partial<T>): T[] {
    const currentEntities = this.getState().entities;
    if (isID(keyOrEntities)) {
      if (currentEntities.has(keyOrEntities)) {
        const entityStored = currentEntities.get(keyOrEntities)!;
        const newEntity = this.preUpdateEntity(this.merger(entityStored, entity as T));
        return [newEntity];
      } else {
        const newEntity = this.preAddEntity(entity as T);
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
          const updated = this.preUpdateEntity(this.merger(currentEntity, item));
          return [...acc, updated];
        } else {
          const newEntity = this.preAddEntity(item as T);
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
    this.update(state => {
      return {
        ...state,
        activeKeys: this.formatActive(idOrEntity),
      };
    });
  }

  addActive(idOrEntity: S | T | Array<S | T>): void {
    const formatted = this.formatActive(idOrEntity);
    this.update(state => {
      return {
        ...state,
        activeKeys: this.createSet([...state.activeKeys, ...formatted]),
      };
    });
  }

  removeActive(idOrEntity: S | T | Array<S | T>): void {
    const formatted = this.formatActive(idOrEntity);
    this.update(state => {
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
    this.update(state => {
      return {
        ...state,
        entities: state.entities.set(id, entity),
      };
    });
  }

  map(callback: EntityUpdateWithId<T, S>): void {
    this.update(state => {
      return {
        ...state,
        entities: state.entities.map(callback),
      };
    });
  }

  preAddEntity(entity: T): T {
    return entity;
  }

  postAddEntity(): void {}

  preUpdateEntity(entity: T): T {
    return entity;
  }

  postUpdateEntity(): void {}

  postUpsertEntity(): void {}

  postRemoveEntity(entitiesRemoved: T[]): void {}
}
