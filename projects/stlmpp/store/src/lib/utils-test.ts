import { Store } from './store/store';
import { Query } from './store/query';
import { Injectable } from '@angular/core';
import { EntityStore } from './entity/entity-store';
import { EntityQuery } from './entity/entity-query';
import { EntityState } from './type';

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
    super({ name: 'simple', initialState: simpleInitialState, cache: 1000 });
  }
}

@Injectable()
export class SimpleQuery extends Query<IdName> {
  constructor(private simpleStore: SimpleStore) {
    super(simpleStore);
  }
}

export interface IdNameEntityState extends EntityState<IdNameEntity> {
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
