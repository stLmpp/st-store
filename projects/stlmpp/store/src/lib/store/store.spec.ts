import { Store } from './store';
import { TestBed } from '@angular/core/testing';
import { debounceTime, take } from 'rxjs/operators';
import { simpleInitialState, SimpleStore } from '../utils-test';

describe('Store', () => {
  let store: SimpleStore;

  const takeOne = () => store.selectState().pipe(take(1));

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SimpleStore] });
    store = TestBed.inject(SimpleStore);
  });

  it('should create the store', () => {
    expect(store).toBeDefined();
    expect(store.getState()).toBeDefined();
    expect(store.getState()).toEqual({ id: 1, name: 'Guilherme' });
  });

  it('should have cache', done => {
    store.setHasCache(true);
    expect(store.hasCache()).toBeTrue();
    store
      .selectCache()
      .pipe(take(1))
      .subscribe(hasCache => {
        expect(hasCache).toBeTrue();
      });
    store
      .selectCache()
      .pipe(debounceTime(1001), take(1))
      .subscribe(hasCache => {
        expect(hasCache).toBeFalse();
      });
    setTimeout(() => {
      expect(store.hasCache()).toBeFalse();
      done();
    }, 1002);
  });

  it('should set the state', () => {
    store.set({ id: 2, name: '2' });
    expect(store.getState()).toEqual({ id: 2, name: '2' });
    store.selectState().subscribe(state => {
      expect(state).toEqual({ id: 2, name: '2' });
    });
  });

  it('should update the state', () => {
    store.update({ name: '1' });
    expect(store.getState()).toEqual({ id: 1, name: '1' });
    takeOne().subscribe(state => {
      expect(state).toEqual({ id: 1, name: '1' });
    });
    store.update(state => ({ ...state, name: 'Guilherme' }));
    expect(store.getState()).toEqual({ id: 1, name: 'Guilherme' });
    takeOne().subscribe(state => {
      expect(state).toEqual({ id: 1, name: 'Guilherme' });
    });
  });

  it('should reset the state', () => {
    store.update({ id: 3, name: '3' });
    expect(store.getState()).toEqual({ id: 3, name: '3' });
    takeOne().subscribe(state => {
      expect(state).toEqual({ id: 3, name: '3' });
    });
    store.reset();
    expect(store.getState()).toEqual(simpleInitialState);
    takeOne().subscribe(state => {
      expect(state).toEqual(simpleInitialState);
    });
  });

  it('should call preUpdate', () => {
    spyOn(store, 'preUpdate').and.callThrough();
    spyOn(store, 'postUpdate').and.callThrough();
    store.update({ id: 2 });
    expect(store.preUpdate).toHaveBeenCalled();
    expect(store.postUpdate).toHaveBeenCalled();
  });
});
