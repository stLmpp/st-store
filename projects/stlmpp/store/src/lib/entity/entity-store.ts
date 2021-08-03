import {
  EntityIdType,
  EntityMergeFn,
  EntityPartialUpdate,
  EntityPredicate,
  EntityState,
  EntityStoreOptions,
  EntityType,
  EntityUpdateWithId,
} from '../type';
import { StMap } from '../map';
import { IdGetterFn, isArray, isFunction, isNil, parseIdGetter } from 'st-utils';
import { devCopy, isEntityId } from '../util';
import { Store } from '../store/store';

function createSet(values: EntityIdType[] = []): Set<EntityIdType> {
  return new Set<EntityIdType>(values);
}

export abstract class EntityStore<
  State extends EntityState<T> = any,
  E = any,
  T extends Record<any, any> = EntityType<State>
> extends Store<State, E> {
  /**
   * @template T
   * @description calling super is required because name is required
   * @param {EntityStoreOptions<State, T>} options
   */
  protected constructor(private options: EntityStoreOptions<State, T>) {
    super({ ...options, initialState: {} as any });
    this._useDevCopy = false;
    this.idGetter = parseIdGetter(options.idGetter ?? ('id' as any));
    this.merger = options.mergeFn ?? ((entityA, entityB) => ({ ...entityA, ...entityB }));
    const initialState = this._getInitialState();
    this.updateInitialState(initialState);
    this.updateState(initialState);
  }

  readonly idGetter: IdGetterFn<T>;
  readonly merger: EntityMergeFn<T>;

  private _createMap(): StMap<T> {
    return new StMap<T>(this.idGetter, this.merger);
  }

  private _getInitialState(): State {
    const entities = this._createMap();
    let activeKeys = createSet();
    let initialState: Partial<State> = {};
    if (this.options.initialState) {
      if (this.options.initialState.entities) {
        const { entities: initialEntities, ...state } = this.options.initialState;
        if (isArray(initialEntities)) {
          entities.fromArray(initialEntities);
        } else {
          entities.fromObject(initialEntities);
        }
        initialState = { ...(state as any) };
      }
    }
    if (this.options.initialActive && this.options.initialState) {
      activeKeys = createSet(this.options.initialActive.filter(key => entities.has(key)));
    }
    return { entities, activeKeys, ...initialState } as State;
  }

  private _addMany(entities: T[]): this {
    const newEntities = entities.map(entity => {
      entity = this.preAddEntity(entity);
      return entity;
    });
    return this.updateState(state => ({
      ...state,
      entities: state.entities.setMany(newEntities),
    }));
  }

  private _addOne(entity: T): this {
    const newEntity = this.preAddEntity(entity);
    return this.updateState(state => ({
      ...state,
      entities: state.entities.set(this.idGetter(newEntity), newEntity),
    }));
  }

  private _preUpsert(keyOrEntities: Array<T | Partial<T>> | EntityIdType, entity?: T | Partial<T>): T[] {
    const currentEntities = this.getState().entities;
    if (isArray(keyOrEntities)) {
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
    } else {
      if (currentEntities.has(keyOrEntities)) {
        const entityStored = currentEntities.get(keyOrEntities)!;
        const newEntity = this.preUpdateEntity(this.merger(entityStored, entity!));
        return [newEntity];
      } else {
        const newEntity = this.preAddEntity(entity as T);
        return [newEntity];
      }
    }
  }

  private _formatActive(idOrEntity: EntityIdType | T | Array<EntityIdType | T>): Set<EntityIdType> {
    if (isArray(idOrEntity)) {
      return idOrEntity.reduce((newSet, ioe) => {
        if (isEntityId(ioe)) {
          newSet.add(ioe);
        } else {
          const key = this.idGetter(ioe);
          newSet.add(key);
        }
        return newSet;
      }, createSet());
    } else if (isEntityId(idOrEntity)) {
      return createSet([idOrEntity]);
    } else {
      const id = this.idGetter(idOrEntity);
      return createSet([id]);
    }
  }

  /**
   * @description update the state partially
   * @param {Partial<State> | ((oldState: State) => State) | State} state
   */
  override updateState(state: State | Partial<State> | ((oldState: State) => State)): this {
    const callback = isFunction(state) ? state : (oldState: State) => ({ ...oldState, ...state });
    return super.updateState(oldState => {
      let newState = callback(oldState);
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        newState = {
          ...newState,
          entities: newState.entities.map(entity => devCopy(entity)),
          activeKeys: createSet([...newState.activeKeys]),
        };
      }
      return newState;
    });
  }

  /**
   * @description set entities to the store (replace previous entities)
   * @param {T[]} array
   */
  setEntities(array: T[]): this {
    array = array.map(entry => this.preAddEntity(entry));
    return this.updateState(state => ({ ...state, entities: state.entities.fromArray(array) }));
  }

  /**
   * @description add a new entity to the store
   * @param {T[] | T} entityOrEntities
   */
  add(entityOrEntities: T | T[]): this {
    if (isArray(entityOrEntities)) {
      this._addMany(entityOrEntities);
    } else {
      this._addOne(entityOrEntities);
    }
    return this.postAddEntity();
  }

  /**
   * @description remove one or more entities from the store
   * @param {EntityIdType | EntityIdType[] | EntityPredicate<T>} idOrIdsOrCallback
   * @returns {this}
   */
  remove(idOrIdsOrCallback: EntityIdType | EntityIdType[] | EntityPredicate<T>): this {
    let callback: EntityPredicate<T>;
    if (isFunction(idOrIdsOrCallback)) {
      callback = (entity, key) => !idOrIdsOrCallback(entity, key);
    } else if (isArray(idOrIdsOrCallback)) {
      const keysSet = new Set(idOrIdsOrCallback);
      callback = (_, key) => keysSet.has(key);
    } else {
      callback = (_, key) => key === idOrIdsOrCallback;
    }
    const entities = this.getState().entities.filter(callback);
    this.updateState(state => ({
      ...state,
      entities: state.entities.remove(idOrIdsOrCallback),
      activeKeys: createSet([...state.activeKeys].filter(key => !entities.has(key))),
    }));
    const entitiesRemoved = entities.values;
    return this.postRemoveEntity(entitiesRemoved);
  }

  /**
   * @description update one or more entities in the store based on a id or predicate
   * @param {EntityIdType | EntityPredicate<T>} idOrPredicate
   * @param {EntityPartialUpdate<T>} partialOrCallback
   */
  updateEntity(idOrPredicate: EntityIdType | EntityPredicate<T>, partialOrCallback: EntityPartialUpdate<T>): this {
    const updateCallback = isFunction(partialOrCallback)
      ? partialOrCallback
      : (entity: T) => this.merger(entity, partialOrCallback);
    if (isEntityId(idOrPredicate)) {
      const entity = this.getState().entities.get(idOrPredicate);
      if (!entity) {
        return this;
      }
      const newEntity = this.preUpdateEntity(updateCallback(entity));
      this.updateState(state => ({ ...state, entities: state.entities.update(idOrPredicate, newEntity) }));
    } else {
      const entitiesMap = this.getState().entities.filter(idOrPredicate);
      if (!entitiesMap.length) {
        return this;
      }
      let entities = entitiesMap.values;
      entities = entities.map(entity => this.preUpdateEntity(updateCallback(entity)));
      this.updateState(state => ({
        ...state,
        entities: state.entities.merge(entities),
      }));
    }
    return this.postUpdateEntity();
  }

  /**
   * @description upsert one or more entities to the store
   * @param {Array<Partial<T> | T> | EntityIdType} keyOrEntities
   * @param {Partial<T> | T} entity
   * @returns {this}
   */
  upsert(keyOrEntities: Array<T | Partial<T>> | EntityIdType, entity?: T | Partial<T>): this {
    const newEntities = this._preUpsert(keyOrEntities, entity);
    return this.updateState(state => ({
      ...state,
      entities: state.entities.upsert(newEntities),
    })).postUpsertEntity();
  }

  /**
   * @description set one or more entities as active
   * @param {EntityIdType | Array<EntityIdType | T> | T} idOrEntity
   * @returns {this}
   */
  setActive(idOrEntity: EntityIdType | T | Array<EntityIdType | T>): this {
    return this.updateState(state => ({
      ...state,
      activeKeys: this._formatActive(idOrEntity),
    }));
  }

  /**
   * @description add active entity
   * @param {EntityIdType | Array<EntityIdType | T> | T} idOrEntity
   */
  addActive(idOrEntity: EntityIdType | T | Array<EntityIdType | T>): this {
    const formatted = this._formatActive(idOrEntity);
    return this.updateState(state => ({
      ...state,
      activeKeys: createSet([...state.activeKeys, ...formatted]),
    }));
  }

  /**
   * @description remove entity from the active
   * @param {EntityIdType | Array<EntityIdType | T> | T} idOrEntity
   */
  removeActive(idOrEntity: EntityIdType | T | Array<EntityIdType | T>): this {
    const formatted = this._formatActive(idOrEntity);
    return this.updateState(state => ({
      ...state,
      activeKeys: createSet([...state.activeKeys].filter(key => !formatted.has(key))),
    }));
  }

  /**
   * @description toggle entity in the active state
   * @param {EntityIdType | T} idOrEntity
   */
  toggleActive(idOrEntity: EntityIdType | T): this {
    const currentState = this.getState();
    const idEntity = isEntityId(idOrEntity) ? idOrEntity : this.idGetter(idOrEntity);
    if (currentState.activeKeys.has(idEntity)) {
      this.removeActive(idEntity);
    } else {
      this.addActive(idEntity);
    }
    return this;
  }

  /**
   * @description remove the entities from the state that are currently active
   * @returns {this}
   */
  removeActiveEntities(): this {
    return this.remove([...this.getState().activeKeys]);
  }

  /**
   * @description replace entity in the store
   * @param {EntityIdType} id
   * @param {T} entity
   */
  replace(id: EntityIdType, entity: T): this {
    return this.updateState(state => ({
      ...state,
      entities: state.entities.set(id, entity),
    }));
  }

  /**
   * @description map all entities in the state
   * @param {EntityUpdateWithId<T>} callback
   */
  map(callback: EntityUpdateWithId<T>): this {
    return this.updateState(state => ({
      ...state,
      entities: state.entities.map(callback),
    }));
  }

  /**
   * @description middleware called before adding a new entity
   * @param {T} entity
   * @returns {T}
   */
  preAddEntity(entity: T): T {
    return entity;
  }

  /**
   * @description middleware called after adding a new entity
   * @returns {this}
   */
  postAddEntity(): this {
    return this;
  }

  /**
   * @description middleware called before updating an entity
   * @param {T} entity
   * @returns {T}
   */
  preUpdateEntity(entity: T): T {
    return entity;
  }

  /**
   * @description middleware called after updating an entity
   * @returns {this}
   */
  postUpdateEntity(): this {
    return this;
  }

  /**
   * @description middleware called after upsertting entities
   * @returns {this}
   */
  postUpsertEntity(): this {
    return this;
  }

  /**
   * @description middleware called after removing entities
   * @param {T[]} entitiesRemoved
   * @returns {this}
   */
  postRemoveEntity(entitiesRemoved: T[]): this {
    return this;
  }
}
