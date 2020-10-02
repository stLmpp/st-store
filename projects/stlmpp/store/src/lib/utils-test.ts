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

export const simpleInitialState: IdName = { id: 1, name: 'Guilherme' };
export const entityInitialState: IdNameEntity[] = [simpleInitialState];

@Injectable()
export class SimpleStore extends Store<IdName> {
  constructor() {
    super({ name: 'simple', initialState: simpleInitialState, cache: 1000, persistKey: 'name' });
  }
}

@Injectable()
export class SimpleStoreCustomPersist extends Store<IdName> {
  constructor() {
    const persistStrategy = new StorePersistCustomStrategy();
    persistStrategy.state[`__ST_STORE__simple-custom-persist.`] = '2';
    super({
      name: 'simple-custom-persist',
      initialState: simpleInitialState,
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

export interface IdNameEntityState extends EntityState<IdNameEntity, number, { code: number }> {
  list: number[];
  loadingNames: boolean;
}

@Injectable()
export class SimpleEntityStore extends EntityStore<IdNameEntityState> {
  constructor() {
    super({ name: 'simple-entity', cache: 1000, initialState: entityInitialState });
  }
}

@Injectable()
export class SimpleEntityQuery extends EntityQuery<IdNameEntityState> {
  constructor(private simpleEntityStore: SimpleEntityStore) {
    super(simpleEntityStore);
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
