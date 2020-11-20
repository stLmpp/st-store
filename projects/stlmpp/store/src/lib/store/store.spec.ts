import { Store } from './store';
import { TestBed } from '@angular/core/testing';
import {
  IdName,
  simpleInitialState,
  SimpleStore,
  SimpleStoreCustomPersist,
  StorePersistCustomStrategy,
  wait,
} from '../util-test';

describe('Store', () => {
  let store: SimpleStore;
  let storeCustomPersist: SimpleStoreCustomPersist;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [SimpleStore, SimpleStoreCustomPersist] });
    store = TestBed.inject(SimpleStore);
    storeCustomPersist = TestBed.inject(SimpleStoreCustomPersist);
  });

  it('should create the store', () => {
    expect(store).toBeDefined();
    expect(store.getState()).toBeDefined();
    expect(store.getState()).toEqual({ id: 1, name: 'Guilherme' });
  });

  it('should have cache', async () => {
    store.setHasCache(true);
    expect(store.hasCache()).toBeTrue();
    await wait(15);
    expect(store.hasCache()).toBeFalse();
  });

  it('should not set cache', () => {
    // @ts-ignore
    store.__options.cache = undefined;
    store.setHasCache(true);
    expect(store.hasCache()).toBeFalse();
  });

  it('should set the state', () => {
    store.set({ id: 2, name: '2' });
    expect(store.getState()).toEqual({ id: 2, name: '2' });
  });

  it('should update the state', () => {
    store.update({ name: '1' });
    expect(store.getState()).toEqual({ id: 1, name: '1' });
    store.update(state => ({ ...state, name: 'Guilherme' }));
    expect(store.getState()).toEqual({ id: 1, name: 'Guilherme' });
  });

  it('should reset the state', () => {
    store.update({ id: 3, name: '3' });
    expect(store.getState()).toEqual({ id: 3, name: '3' });
    store.reset();
    expect(store.getState()).toEqual(simpleInitialState());
  });

  it('should call preUpdate', () => {
    spyOn(store, 'preUpdate').and.callThrough();
    spyOn(store, 'postUpdate').and.callThrough();
    store.update({ id: 2 });
    expect(store.preUpdate).toHaveBeenCalled();
    expect(store.postUpdate).toHaveBeenCalled();
  });

  it('should return the persist key', () => {
    // @ts-ignore
    const key = store.getPersistKey();
    expect(key).toBe('__ST_STORE__simple.name');
  });

  it('should create with custom persist strategy', () => {
    // @ts-ignore
    expect(storeCustomPersist.__persist).toBeInstanceOf(StorePersistCustomStrategy);
  });

  it('should persist value', () => {
    expect(storeCustomPersist.getState().id).toBe(2);
    storeCustomPersist.update({ id: 1 });
    // @ts-ignore
    expect(storeCustomPersist.__persist.get(storeCustomPersist.getPersistKey())).toBe('1');
    storeCustomPersist.update({ id: undefined });
    // @ts-ignore
    expect(storeCustomPersist.__persist.get(storeCustomPersist.getPersistKey())).toBeUndefined();

    const newStore = new (class extends Store<IdName> {
      constructor() {
        super({
          name: 'simple-custom-persist',
          initialState: simpleInitialState(),
          persistStrategy: new StorePersistCustomStrategy(),
        });
      }
    })();
    expect(newStore.getState().id).toBe(1);
  });
});
