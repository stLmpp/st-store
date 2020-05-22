import { Injectable } from '@angular/core';
import { EntityStore } from '../../../st-store/src/lib/entity/entity-store';
import { EntityQuery } from '../../../st-store/src/lib/entity/entity-query';
import { map } from 'rxjs/operators';
import { Store } from '../../../st-store/src/lib/store/store';
import { Query } from '../../../st-store/src/lib/store/query';

export interface School {
  id: number;
  name: string;
}

export interface AppTeste {
  id: number;
  name: string;
  sur: string;
  school?: School;

  selected?: boolean;
}

@Injectable({ providedIn: 'root' })
export class AppStore extends EntityStore<AppTeste> {
  constructor() {
    super({ cache: 5000, name: 'app' });
  }

  preAdd(entity: AppTeste): AppTeste {
    console.log(entity);
    return super.preAdd(entity);
  }

  preUpdate(entity: AppTeste): AppTeste {
    console.log(entity);
    return super.preUpdate(entity);
  }

  postRemove(entitiesRemoved: AppTeste[]): void {
    console.log(entitiesRemoved);
    super.postRemove(entitiesRemoved);
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

@Injectable({ providedIn: 'root' })
export class AppSimpleStore extends Store<AppTeste> {
  constructor() {
    super({ persist: 'school.id', name: 'app-simple' });
  }
}

@Injectable({ providedIn: 'root' })
export class AppSimpleQuery extends Query<AppTeste> {
  constructor(private appSimpleStore: AppSimpleStore) {
    super(appSimpleStore);
  }
}
