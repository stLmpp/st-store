import { Injectable } from '@angular/core';
import { map } from 'rxjs/operators';
import { EntityStore } from '../../../stlmpp/store/src/lib/entity/entity-store';
import { EntityQuery } from '../../../stlmpp/store/src/lib/entity/entity-query';
import { Store } from '../../../stlmpp/store/src/lib/store/store';
import { Query } from '../../../stlmpp/store/src/lib/store/query';

export interface School {
  id: number;
  name: string;
  idApp?: number;
}

export interface Simple {
  id: number;
  name: string;
}

export interface AppTeste {
  id: number;
  name: string;
  sur: string;
  schools?: School[];
  idSimple?: number;
  simple?: Simple;
  selected?: boolean;
}

@Injectable({ providedIn: 'root' })
export class SchoolStore extends EntityStore<School> {
  constructor() {
    super({ cache: 5000, name: 'school' });
  }
}

@Injectable({ providedIn: 'root' })
export class SchoolQuery extends EntityQuery<School> {
  constructor(private schoolStore: SchoolStore) {
    super(schoolStore);
  }
}

@Injectable({ providedIn: 'root' })
export class SimpleStore extends Store<Simple> {
  constructor() {
    super({ name: 'simple' });
  }
}

@Injectable({ providedIn: 'root' })
export class SimpleQuery extends Query<Simple> {
  constructor(private simpleStore: SimpleStore) {
    super(simpleStore);
  }
}

@Injectable({ providedIn: 'root' })
export class AppStore extends EntityStore<AppTeste> {
  constructor(
    private schoolStore: SchoolStore,
    private simpleStore: SimpleStore
  ) {
    super({
      cache: 5000,
      name: 'app',
      children: [
        {
          key: 'schools',
          store: schoolStore,
          relation: (relation: School) => relation.idApp,
        },
        {
          key: 'simple',
          store: simpleStore,
          relation: (relation: Simple) => relation.id,
          reverseRelation: entity => entity.idSimple,
        },
      ],
    });
  }
}

@Injectable({ providedIn: 'root' })
export class AppQuery extends EntityQuery<AppTeste> {
  constructor(private appStore: AppStore) {
    super(appStore);
  }

  hasSelected$ = this.all$.pipe(
    map(entities => entities.some(entity => entity.selected))
  );
}
