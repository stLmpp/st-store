import { SimpleStore } from '../util-test';
import { TestBed } from '@angular/core/testing';
import { delay, of, tap } from 'rxjs';
import { setLoading } from './set-loading';

describe('set loading', () => {
  let store: SimpleStore;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SimpleStore] });
    store = TestBed.inject(SimpleStore);
  });

  it('should set the loading while the observable is not completed', done => {
    of(null)
      .pipe(
        delay(10),
        setLoading(store),
        tap(() => {
          expect(store.getLoading()).toBeTrue();
        }),
        delay(10)
      )
      .subscribe(() => {
        expect(store.getLoading()).toBeFalse();
        done();
      });
  });
});
