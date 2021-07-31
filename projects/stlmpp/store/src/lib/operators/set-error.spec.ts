import { SimpleStore } from '../util-test';
import { TestBed } from '@angular/core/testing';
import { catchError, map, of } from 'rxjs';
import { setError } from './set-error';

describe('set error', () => {
  let store: SimpleStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SimpleStore] });
    store = TestBed.inject(SimpleStore);
  });

  it('should store the error', done => {
    of(null)
      .pipe(
        map(() => {
          throw new Error();
        }),
        setError(store),
        catchError(() => of(null))
      )
      .subscribe(() => {
        expect(store.getError()).not.toBeNull();
        expect(store.getError()).toBeDefined();
        done();
      });
  });
});
