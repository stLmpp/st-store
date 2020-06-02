import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  TrackByFunction,
} from '@angular/core';
import {
  AppQuery,
  AppStore,
  AppTeste,
  School,
  SchoolQuery,
  SchoolStore,
  Simple,
  SimpleQuery,
  SimpleStore,
} from './app.service';
import { Subject } from 'rxjs';
import { RouterQuery } from '../../../stlmpp/router/src/lib/router.query';
import { ActivatedRoute, Router } from '@angular/router';

function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomString(): string {
  return Math.random().toString(36).substring(7);
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(
    private appStore: AppStore,
    public appQuery: AppQuery,
    private schoolStore: SchoolStore,
    public schoolQuery: SchoolQuery,
    private simpleStore: SimpleStore,
    public simpleQuery: SimpleQuery,
    private routerQuery: RouterQuery,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  private _destroy$ = new Subject();

  trackBySchool: TrackByFunction<School> = (_, element) => element.id;
  trackByApp: TrackByFunction<AppTeste> = (_, element) => element.id;

  updateSimple(property: keyof Simple, value: Simple[keyof Simple]): void {
    this.simpleStore.update({ [property]: value });
  }

  updateSchool(
    id: number,
    property: keyof School,
    value: School[keyof School]
  ): void {
    this.schoolStore.update(id, { [property]: value });
  }

  removeSchool(id: number): void {
    this.schoolStore.remove(id);
  }

  addNew(): void {
    const id = randomInteger(1, 99999999999999999999);
    this.appStore.add({
      idSimple: 1,
      simple: this.simpleQuery.getState(),
      sur: randomString(),
      name: randomString(),
      id,
    });
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { teste: 'TESTE', teste1: id },
    });
  }

  addSchool(idApp: number): void {
    this.schoolStore.add({
      name: randomString(),
      id: randomInteger(1, 9999999999999999999),
    });
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: { teste: 'TESTE123', teste2: idApp },
    });
  }

  ngOnInit(): void {
    this.routerQuery.selectQueryParams().subscribe(o => console.log(o));
    this.appStore.set([
      {
        id: 1,
        name: 'Teste',
        sur: 'Teste2',
        idSimple: 1,
        simple: {
          id: 1,
          name: 'Not so simple',
        },
        idSchool: 1,
      },
    ]);
    this.schoolStore.add([
      {
        id: 1,
        name: 'Teste',
      },
      {
        id: 2,
        name: 'Teste2',
      },
    ]);
    this.simpleStore.set({
      id: 1,
      name: 'Simple things',
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
