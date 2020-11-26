import { simpleInitialState, SimpleQuery, SimpleStore } from '../util-test';
import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';

describe('Query', () => {
  let query: SimpleQuery;
  let store: SimpleStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SimpleStore, SimpleQuery],
    });
    query = TestBed.inject(SimpleQuery);
    store = TestBed.inject(SimpleStore);
  });

  it('should create the query', () => {
    expect(query).toBeDefined();
    expect(store).toBeDefined();
    expect(query.getState()).toBeDefined();
    expect(query.getState()).toEqual(simpleInitialState());
  });

  it('should select', () => {
    query
      .select()
      .pipe(take(1))
      .subscribe(state => {
        expect(state).toEqual(simpleInitialState());
      });
    query
      .select('id')
      .pipe(take(1))
      .subscribe(id => {
        expect(id).toBe(1);
      });
    query
      .select(state => state.name)
      .pipe(take(1))
      .subscribe(name => {
        expect(name).toBe('Guilherme');
      });
  });

  it('should select as key value', () => {
    query
      .selectAsKeyValue()
      .pipe(take(1))
      .subscribe(state => {
        expect(state).toEqual([
          { key: 'id', value: 1 },
          { key: 'name', value: 'Guilherme' },
        ]);
      });
    query
      .selectAsKeyValue(['name'])
      .pipe(take(1))
      .subscribe(state => {
        expect(state).toEqual([{ key: 'name', value: 'Guilherme' }]);
      });
  });

  it('should not select until changed', () => {
    const observable = query.selectAsKeyValue(['id']);
    const spy = jasmine.createSpy('subscriber');
    observable.subscribe(spy);
    expect(spy).toHaveBeenCalledTimes(1);
    store.update({ id: 2 });
    expect(spy).toHaveBeenCalledTimes(2);
    store.update({ name: '2' });
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should be loading', () => {
    store.setLoading(true);
    expect(query.getLoading()).toBeTrue();
    query.loading$.pipe(take(1)).subscribe(loading => {
      expect(loading).toBeTrue();
    });
    store.setLoading(false);
    expect(query.getLoading()).toBeFalse();
    query.loading$.pipe(take(1)).subscribe(loading => {
      expect(loading).toBeFalse();
    });
  });

  it('should have error', () => {
    store.setError('Error');
    expect(query.getError()).toBe('Error');
    query.error$.pipe(take(1)).subscribe(error => {
      expect(error).toBe('Error');
    });
    store.setError(null);
    expect(query.getError()).toBeNull();
    query.error$.pipe(take(1)).subscribe(error => {
      expect(error).toBeNull();
    });
  });
});
