import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  TrackByFunction,
} from '@angular/core';
import {
  AppQuery,
  AppSimpleQuery,
  AppSimpleStore,
  AppStore,
  AppTeste,
} from './app.service';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { combineLatest, Observable, Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';

let id = 1255;

function makeid(length: number): string {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

function createRandomObj(
  fieldCount: number,
  allowNested: boolean,
  isNested?: boolean
): any {
  const generatedObj = {};

  for (let i = 0; i < fieldCount; i++) {
    let generatedObjField;

    switch (randomInt(7)) {
      case 0:
        generatedObjField = randomInt(1000);
        break;

      case 1:
        generatedObjField = randomInt(10000) + Math.round(Math.random());
        break;

      case 2:
        generatedObjField = Math.random() < 0.5;
        break;

      case 3:
        generatedObjField = makeid(randomInt(4) + 4);
        break;

      case 4:
        generatedObjField = null;
        break;

      case 5:
        if (isNested) {
          if (Math.random() < 0.5) {
            generatedObjField = createRandomObj(
              fieldCount - 1,
              allowNested,
              isNested
            );
          }
        } else {
          generatedObjField = createRandomObj(
            fieldCount - 1,
            allowNested,
            isNested
          );
        }
        break;
      case 6:
        if (isNested) {
          if (Math.random() < 0.5) {
            generatedObjField = Array.from({
              length: randomInt(fieldCount),
            }).map(() =>
              createRandomObj(fieldCount - 1, allowNested, isNested)
            );
          }
        } else {
          generatedObjField = Array.from({
            length: randomInt(fieldCount),
          }).map(() => createRandomObj(fieldCount - 1, allowNested, isNested));
        }
        break;
    }
    generatedObj[makeid(8)] = generatedObjField;
  }
  return generatedObj;
}

function randomInt(rightBound: number): number {
  return Math.floor(Math.random() * rightBound);
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
    public appSimpleQuery: AppSimpleQuery,
    private appSimpleStore: AppSimpleStore
  ) {}

  private _destroy$ = new Subject();

  simpleName$ = this.appSimpleQuery.select('name');
  simpleCallback$ = this.appSimpleQuery.select(state => state.id);
  simpleKeyValues$ = this.appSimpleQuery.selectAsKeyValue();
  simpleKeyValuesNameSur$ = this.appSimpleQuery.selectAsKeyValue([
    'name',
    'sur',
  ]);

  title = 'test';

  form = new FormGroup({
    name: new FormControl(null, [Validators.required]),
    sur: new FormControl(null, [Validators.required]),
  });

  searchControl = new FormControl();
  search$ = this.searchControl.valueChanges.pipe(debounceTime(300));

  nroControl = new FormControl(50);
  itemsPerPageControl = new FormControl(15);

  random$: Observable<any>;

  page = 1;

  trackBy: TrackByFunction<AppTeste> = (_, entity) => entity.id;

  add(): void {
    this.appStore.add({ ...this.form.value, id: id++ });
    this.form.reset({});
  }

  delete(item: AppTeste): void {
    this.appStore.remove(item.id);
  }

  deleteSelected(): void {
    this.appStore.remove(entity => entity.selected);
  }

  update(item: AppTeste, field: keyof AppTeste, newValue: any): void {
    this.appStore.update(item.id, { [field]: newValue });
  }

  toggleActive(item: AppTeste): void {
    this.appStore.toggleActive(item);
  }

  changeRandom(): void {
    this.random$ = this.appQuery.selectEntity(
      this.appQuery.getAll()[
        Math.floor(Math.random() * this.appQuery.getAll().length)
      ].id
    );
    this.random$.subscribe(console.log);
  }

  removeAndUpsert(): void {
    this.appStore.upsert([
      {
        id: 1000,
        name: 'TESTE1255',
      },
      {
        id: 1256,
        name: 'TESTE1256',
      },
    ]);
  }

  updateSimple<K extends keyof AppTeste>(
    property: K,
    value: AppTeste[K]
  ): void {
    this.appSimpleStore.update({ [property]: value });
  }

  ngOnInit(): void {
    this.appStore.set(
      Array.from({
        length: 15 * 5,
      }).map((o, i) => {
        return {
          id: id++,
          name: makeid(5),
          sur: makeid(5),
          ...createRandomObj(randomInt(5), true),
        };
      })
    );
    combineLatest([this.itemsPerPageControl.valueChanges, this.search$])
      .pipe(takeUntil(this._destroy$))
      .subscribe(() => (this.page = 1));
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
