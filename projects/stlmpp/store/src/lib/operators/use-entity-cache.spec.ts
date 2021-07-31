import { IdNameEntity, SimpleEntityStore, simpleInitialState } from '../util-test';
import { TestBed } from '@angular/core/testing';
import { catchError, map, of, throwError } from 'rxjs';
import { useEntityCache } from './use-entity-cache';

describe('use entity cache', () => {
  let entityStore: SimpleEntityStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SimpleEntityStore] });
    entityStore = TestBed.inject(SimpleEntityStore);
  });

  it('should return the cached value', done => {
    of<IdNameEntity>({ id: 1, name: '1' })
      .pipe(useEntityCache(1, entityStore as any)) // FIXME
      .subscribe(value => {
        expect(value).toEqual(simpleInitialState());
        done();
      });
  });

  it('should not return the cached value', done => {
    of<IdNameEntity>({ id: 2, name: '2' })
      .pipe(useEntityCache(2, entityStore as any)) // FIXME
      .subscribe(value => {
        expect(value).toEqual({ id: 2, name: '2' });
        done();
      });
  });

  it('should throw error', done => {
    const spy = jasmine.createSpy();
    of<IdNameEntity>({ id: 2, name: '2' })
      .pipe(
        map(() => {
          throw new Error();
        }),
        useEntityCache(2, entityStore as any), // FIXME
        catchError(err => {
          spy();
          expect(spy).toHaveBeenCalled();
          done();
          return throwError(err);
        }),
        catchError(() => of(null))
      )
      .subscribe();
  });
});
