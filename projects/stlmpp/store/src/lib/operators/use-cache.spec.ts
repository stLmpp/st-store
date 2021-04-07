import { IdName, SimpleEntityStore, SimpleStore } from '../util-test';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';
import { useCache } from './use-cache';
import { catchError, map, tap } from 'rxjs/operators';

describe('use cache', () => {
  let store: SimpleStore;
  let entityStore: SimpleEntityStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SimpleStore, SimpleEntityStore] });
    store = TestBed.inject(SimpleStore);
    entityStore = TestBed.inject(SimpleEntityStore);
  });

  it('should set the cache flag (store)', done => {
    const get = (): Observable<IdName> =>
      of({ id: 1, name: '1' }).pipe(
        useCache(store),
        tap(value => {
          store.setState(value);
        })
      );
    get().subscribe();
    get().subscribe(() => {
      expect(store.hasCache()).toBeTrue();
      setTimeout(() => {
        expect(store.hasCache()).toBeFalse();
        done();
      }, 15);
    });
  });

  it('should set the cache flag (entity)', done => {
    const get = (): Observable<IdName[]> =>
      of([{ id: 1, name: '1' }]).pipe(
        useCache(entityStore),
        tap(value => {
          entityStore.setEntities(value);
        })
      );
    get().subscribe();
    get().subscribe(() => {
      expect(entityStore.hasCache()).toBeTrue();
      setTimeout(() => {
        expect(entityStore.hasCache()).toBeFalse();
        done();
      }, 15);
    });
  });

  it('should throw error', () => {
    const spy = jasmine.createSpy();
    of({ id: 1, name: '1' })
      .pipe(
        map(() => {
          throw new Error();
        }),
        useCache(store),
        catchError(err => {
          spy();
          return throwError(err);
        }),
        catchError(() => of(null))
      )
      .subscribe();
    expect(spy).toHaveBeenCalled();
  });
});
