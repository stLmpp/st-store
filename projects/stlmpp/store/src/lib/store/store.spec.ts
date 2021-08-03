import { getPersistKey, Store } from './store';
import { TestBed } from '@angular/core/testing';
import {
  IdName,
  simpleInitialState,
  SimpleStore,
  SimpleStoreCustomPersist,
  StorePersistCustomStrategy,
  StorePersistCustomStrategyObservable,
  StorePersistCustomStrategyPromise,
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
    store._options.cache = undefined;
    store.setHasCache(true);
    expect(store.hasCache()).toBeFalse();
  });

  it('should set the state', () => {
    store.setState({ id: 2, name: '2' });
    expect(store.getState()).toEqual({ id: 2, name: '2' });
  });

  it('should update the state', () => {
    store.updateState({ name: '1' });
    expect(store.getState()).toEqual({ id: 1, name: '1' });
    store.updateState(state => ({ ...state, name: 'Guilherme' }));
    expect(store.getState()).toEqual({ id: 1, name: 'Guilherme' });
  });

  it('should reset the state', () => {
    store.updateState({ id: 3, name: '3' });
    expect(store.getState()).toEqual({ id: 3, name: '3' });
    store.reset();
    expect(store.getState()).toEqual(simpleInitialState());
  });

  it('should call preUpdate', () => {
    spyOn(store, 'preUpdate').and.callThrough();
    spyOn(store, 'postUpdate').and.callThrough();
    store.updateState({ id: 2 });
    expect(store.preUpdate).toHaveBeenCalled();
    expect(store.postUpdate).toHaveBeenCalled();
  });

  it('should return the persist key', () => {
    // @ts-ignore
    const key = getPersistKey(store._options.name, store._options.persistKey);
    expect(key).toBe('__ST_STORE__simple.name');
  });

  it('should create with custom persist strategy', () => {
    // @ts-ignore
    expect(storeCustomPersist._persistStrategy).toBeInstanceOf(StorePersistCustomStrategy);
  });

  it('should persist value', () => {
    expect(storeCustomPersist.getState().id).toBe(2);
    storeCustomPersist.updateState({ id: 1 });
    // @ts-ignore
    const key = getPersistKey(storeCustomPersist._options.name, storeCustomPersist._options.persistKey);
    // @ts-ignore
    expect(storeCustomPersist._persistStrategy.get(key)).toBe('1');
    storeCustomPersist.updateState({ id: undefined });
    // @ts-ignore
    expect(storeCustomPersist._persistStrategy.get(key)).toBeUndefined();

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

  it('should destroy the store', () => {
    const spy = jasmine.createSpy();
    store.selectState().subscribe(spy);
    expect(spy).toHaveBeenCalledTimes(1);
    store.destroy();
    store.updateState({ id: 1 });
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should persist with observable', async () => {
    const persistStrategy = new StorePersistCustomStrategyObservable();
    const customName = 'simple-custom-persist-observable';
    persistStrategy.state[getPersistKey(customName)] = '2';
    class CustomStore extends Store<IdName> {
      constructor() {
        super({
          name: customName,
          initialState: { name: 'name', id: 1 },
          persistStrategy,
        });
      }
    }
    const customStore = new CustomStore();
    await wait(0);
    expect(customStore.getState().id).toBe(2);
  });

  it('should persist with promise', async () => {
    const persistStrategy = new StorePersistCustomStrategyPromise();
    const customName = 'simple-custom-persist-promise';
    persistStrategy.state[getPersistKey(customName)] = '2';
    class CustomStore extends Store<IdName> {
      constructor() {
        super({ name: customName, initialState: { name: 'name', id: 1 }, persistStrategy });
      }
    }
    const customStore = new CustomStore();
    await wait(0);
    expect(customStore.getState().id).toBe(2);
  });

  it('should wait for the persisted value to be merged', done => {
    const persistStrategy = new StorePersistCustomStrategyPromise();
    const customName = 'simple-custom-persist-promise';
    persistStrategy.state[getPersistKey(customName)] = '2';
    class CustomStore extends Store<IdName> {
      constructor() {
        super({
          name: customName,
          initialState: { name: 'name', id: 1 },
          persistStrategy,
        });
      }
    }
    const customStore = new CustomStore();
    customStore.waitForPersistedValue().subscribe(() => {
      expect(customStore.getState().id).toBe(2);
      done();
    });
  });
});
