/* istanbul ignore file */

import { Store } from './store/store';
import { Query } from './store/query';
import { Injectable } from '@angular/core';
import { EntityStore } from './entity/entity-store';
import { EntityQuery } from './entity/entity-query';
import { EntityState } from './type';
import { StorePersistStrategy } from './store/store-persist';

export interface IdName {
  id: number;
  name: string;
}

export interface IdNameEntity {
  id: number;
  name: string;
  other?: string;
}

export const simpleInitialState = (): IdName => ({ id: 1, name: 'Guilherme' });
export const entityInitialState = (): IdNameEntity[] => [simpleInitialState()];

@Injectable()
export class SimpleStore extends Store<IdName> {
  constructor() {
    super({ name: 'simple', initialState: simpleInitialState(), cache: 10, persistKey: 'name' });
  }
}

export class StorePersistCustomStrategy implements StorePersistStrategy<IdName> {
  state: Record<string, string | undefined> = {};
  deserialize(value: string | undefined): any {
    return value ? JSON.parse(value) : undefined;
  }

  get(key: string): string | undefined {
    return this.state[key];
  }

  getStore(state: IdName, key?: keyof IdName): any {
    return state.id;
  }

  serialize(value: any): string | undefined {
    return value ? JSON.stringify(value) : undefined;
  }

  set(key: string, value: string | undefined): void {
    this.state[key] = value;
  }

  setStore(state: IdName, value: any, key?: keyof IdName): IdName {
    return { ...state, id: value };
  }
}

const persistStrategy = new StorePersistCustomStrategy();
persistStrategy.state[`__ST_STORE__simple-custom-persist.`] = '2';

@Injectable()
export class SimpleStoreCustomPersist extends Store<IdName> {
  constructor() {
    super({
      name: 'simple-custom-persist',
      initialState: simpleInitialState(),
      cache: 1000,
      persistStrategy,
    });
  }
}

@Injectable()
export class SimpleQuery extends Query<IdName> {
  constructor(private simpleStore: SimpleStore) {
    super(simpleStore);
  }
}

export interface IdNameEntityStateError {
  code: number;
}

export interface IdNameEntityState extends EntityState<IdNameEntity> {
  list: number[];
  loadingNames: boolean;
}

@Injectable()
export class SimpleEntityStore extends EntityStore<IdNameEntityState, IdNameEntityStateError> {
  constructor() {
    super({ name: 'simple-entity', cache: 10, initialState: { entities: entityInitialState() } });
  }
}

@Injectable()
export class SimpleEntityQuery extends EntityQuery<IdNameEntityState, IdNameEntityStateError> {
  constructor(private simpleEntityStore: SimpleEntityStore) {
    super(simpleEntityStore);
  }
}

export function wait(ms = 1000): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
