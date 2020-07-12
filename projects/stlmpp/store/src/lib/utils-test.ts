import { Store } from './store/store';
import { Query } from './store/query';
import { Injectable } from '@angular/core';
import { EntityStore } from './entity/entity-store';
import { EntityQuery } from './entity/entity-query';

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

@Injectable()
export class SimpleEntityStore extends EntityStore<IdNameEntity> {
  constructor() {
    super({ name: 'simple-entity', cache: 1000, initialState: entityInitialState });
  }
}

@Injectable()
export class SimpleEntityQuery extends EntityQuery<IdNameEntity> {
  constructor(private simpleEntityStore: SimpleEntityStore) {
    super(simpleEntityStore);
  }
}
