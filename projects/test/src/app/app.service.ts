import { Injectable } from '@angular/core';
import { StStore } from '../../../st-store/src/lib/st-store';
import { StQuery } from '../../../st-store/src/lib/st-query';
import { map } from 'rxjs/operators';

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
export class AppStore extends StStore<AppTeste> {
  constructor() {
    super({ cache: 5000 });
  }
}

@Injectable({ providedIn: 'root' })
export class AppQuery extends StQuery<AppTeste> {
  constructor(private appStore: AppStore) {
    super(appStore);
  }

  hasSelected$ = this.all$.pipe(
    map(entities => entities.some(entity => entity.selected))
  );
}
