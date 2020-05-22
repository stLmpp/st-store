import { DeepPartial, EntityState, ID, IdGetter, StStoreOptions } from './type';
import { BehaviorSubject, Observable, Subject, timer } from 'rxjs';
import { StMap } from './map';
import { isArray, isFunction, isPrimitive, isString } from 'is-what';
import { deepMerge } from './utils';
import { get } from 'lodash';
import { take, takeUntil } from 'rxjs/operators';

const ST_STORE_DEFAULT_OPTIONS: StStoreOptions<any, any> = {
  idGetter: entity => entity.id,
};

export class StStore<T, S extends ID = number, E = any> {
  constructor(options: StStoreOptions<T, S> = {}) {
    if (options.idGetter) {
      if (isString(options.idGetter) || isArray(options.idGetter)) {
        this.idGetter = e => get(e, options.idGetter as any);
      } else if (isFunction(options.idGetter)) {
        this.idGetter = options.idGetter;
      }
    } else {
      this.idGetter = ST_STORE_DEFAULT_OPTIONS.idGetter as any;
    }
    this.options = { ...(ST_STORE_DEFAULT_OPTIONS as any), ...options };
    this.setInitialState();
  }

  idGetter: IdGetter<T, S>;
  options: StStoreOptions<T, S> = {};

  private timeout: any;
  cache$ = new BehaviorSubject(false);

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

  hasCache(): boolean {
    return this.options.cache && this.cache$.value;
  }

  setHasCache(hasCache: boolean): void {
    if (this.options.cache) {
      clearTimeout(this.timeout);
      this.cache$.next(hasCache);
      this.timeout = setTimeout(() => {
        this.setHasCache(false);
      }, this.options.cache);
    }
  }

  private setState(state: EntityState<T, S, E>): void {
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
    entityOrEntities = this.preAdd(entityOrEntities);
    this.updateState(state => {
      return {
        ...state,
        entities: state.entities.merge(
          isArray(entityOrEntities) ? entityOrEntities : [entityOrEntities]
        ),
      };
    });
    this.postAdd(entityOrEntities);
  }

  remove(idOrIds: S | S[]): void;
  remove(callback: (entity: T, key: S) => boolean): void;
  remove(idOrIdsOrCallback: S | S[] | ((entity: T, key: S) => boolean)): void {
    this.updateState(state => {
      return { ...state, entities: state.entities.remove(idOrIdsOrCallback) };
    });
    this.postDelete();
  }

  update(id: S, partial: DeepPartial<T>): void;
  update(id: S, callback: (entity: T) => T): void;
  update(id: S, partialOrCallback: DeepPartial<T> | ((entity: T) => T)): void {
    const entityStored = this.getState().entities.get(id);
    if (!entityStored) return;
    const callback = isFunction(partialOrCallback)
      ? partialOrCallback
      : entity => deepMerge(entity, partialOrCallback);
    const newEntity = callback(entityStored);
    this.preUpdate(newEntity);
    this.updateState(state => {
      return {
        ...state,
        entities: state.entities.set(id, newEntity),
      };
    });
    this.postUpdate(newEntity);
  }

  upsert(entities: T[] | DeepPartial<T>[]): void;
  upsert(key: S, entity: T | DeepPartial<T>): void;
  upsert(
    keyOrEntities: T[] | DeepPartial<T>[] | S,
    entity?: T | DeepPartial<T>
  ): void {
    this.updateState(state => {
      return {
        ...state,
        entities: state.entities.upsert(keyOrEntities, entity),
      };
    });
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

  setLoading(loading: boolean): void {
    this.updateState({ loading });
  }

  setError(error: E): void {
    this.updateState({ error });
  }

  reset(): void {
    this.setInitialState();
  }

  preAdd(entityOrEntities: T | T[]): T | T[] {
    return entityOrEntities;
  }

  postAdd(entityOrEntities: T | T[]): void {
    this.updateActive();
  }

  preUpdate(entityOrEntities: T | T[]): T | T[] {
    return entityOrEntities;
  }

  postUpdate(entityOrEntities: T | T[]): void {
    this.updateActive();
  }

  postUpsert(): void {
    this.updateActive();
  }

  postDelete(): void {
    this.updateActive();
  }
}
