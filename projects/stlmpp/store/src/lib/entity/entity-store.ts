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
import { environment } from '../environment';
import { Store } from '../store/store';

function createSet(values: EntityIdType[] = []): Set<EntityIdType> {
  return new Set<EntityIdType>(values);
}

export class EntityStore<
  State extends EntityState<T> = any,
  E = any,
  T extends Record<any, any> = EntityType<State>
> extends Store<State, E> {
  constructor(private options: EntityStoreOptions<State, T>) {
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

  private _addMany(entities: T[]): void {
    const newEntities = entities.map(entity => {
      entity = this.preAddEntity(entity);
      return entity;
    });
    this.updateState(state => ({
      ...state,
      entities: state.entities.setMany(newEntities),
    }));
  }

  private _addOne(entity: T): void {
    const newEntity = this.preAddEntity(entity);

    this.updateState(state => ({
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
   * @deprecated since version 5.1.0 (use EntityStore.updateState)
   */
  update(state: State | Partial<State> | ((oldState: State) => State)): void {
    this.updateState(state);
  }

  updateState(state: State | Partial<State> | ((oldState: State) => State)): void {
    const callback = isFunction(state) ? state : (oldState: State) => ({ ...oldState, ...state });
    super.updateState(oldState => {
      let newState = callback(oldState);
      if (typeof ngDevMode === 'undefined' || ngDevMode) {
        if (environment.isDev) {
          newState = {
            ...newState,
            entities: newState.entities.map(entity => devCopy(entity)),
            activeKeys: createSet([...newState.activeKeys]),
          };
        }
      }
      return newState;
    });
  }

  setEntities(array: T[]): void {
    array = array.map(entry => this.preAddEntity(entry));
    this.updateState(state => ({ ...state, entities: state.entities.fromArray(array) }));
  }

  add(entityOrEntities: T | T[]): void {
    if (isArray(entityOrEntities)) {
      this._addMany(entityOrEntities);
    } else {
      this._addOne(entityOrEntities);
    }
    this.postAddEntity();
  }

  remove(idOrIdsOrCallback: EntityIdType | EntityIdType[] | EntityPredicate<T>): void {
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
    this.postRemoveEntity(entitiesRemoved);
  }

  updateEntity(idOrPredicate: EntityIdType | EntityPredicate<T>, partialOrCallback: EntityPartialUpdate<T>): void {
    const updateCallback = isFunction(partialOrCallback)
      ? partialOrCallback
      : (entity: T) => this.merger(entity, partialOrCallback);
    if (isEntityId(idOrPredicate)) {
      const entity = this.getState().entities.get(idOrPredicate);
      if (!entity) {
        return;
      }
      const newEntity = this.preUpdateEntity(updateCallback(entity));
      this.updateState(state => ({ ...state, entities: state.entities.update(idOrPredicate, newEntity) }));
    } else {
      const entitiesMap = this.getState().entities.filter(idOrPredicate);
      if (!entitiesMap.length) {
        return;
      }
      let entities = entitiesMap.values;
      entities = entities.map(entity => this.preUpdateEntity(updateCallback(entity)));
      this.updateState(state => ({
        ...state,
        entities: state.entities.merge(entities),
      }));
    }
    this.postUpdateEntity();
  }

  upsert(keyOrEntities: Array<T | Partial<T>> | EntityIdType, entity?: T | Partial<T>): void {
    const newEntities = this._preUpsert(keyOrEntities, entity);
    this.updateState(state => ({
      ...state,
      entities: state.entities.upsert(newEntities),
    }));
    this.postUpsertEntity();
  }

  setActive(idOrEntity: EntityIdType | T | Array<EntityIdType | T>): void {
    this.updateState(state => ({
      ...state,
      activeKeys: this._formatActive(idOrEntity),
    }));
  }

  addActive(idOrEntity: EntityIdType | T | Array<EntityIdType | T>): void {
    const formatted = this._formatActive(idOrEntity);
    this.updateState(state => ({
      ...state,
      activeKeys: createSet([...state.activeKeys, ...formatted]),
    }));
  }

  removeActive(idOrEntity: EntityIdType | T | Array<EntityIdType | T>): void {
    const formatted = this._formatActive(idOrEntity);
    this.updateState(state => ({
      ...state,
      activeKeys: createSet([...state.activeKeys].filter(key => !formatted.has(key))),
    }));
  }

  toggleActive(idOrEntity: EntityIdType | T): void {
    const currentState = this.getState();
    const idEntity = isEntityId(idOrEntity) ? idOrEntity : this.idGetter(idOrEntity);
    if (currentState.activeKeys.has(idEntity)) {
      this.removeActive(idEntity);
    } else {
      this.addActive(idEntity);
    }
  }

  removeActiveEntities(): void {
    this.remove([...this.getState().activeKeys]);
  }

  replace(id: EntityIdType, entity: T): void {
    this.updateState(state => ({
      ...state,
      entities: state.entities.set(id, entity),
    }));
  }

  map(callback: EntityUpdateWithId<T>): void {
    this.updateState(state => ({
      ...state,
      entities: state.entities.map(callback),
    }));
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
