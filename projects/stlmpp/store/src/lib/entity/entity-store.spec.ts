import { entityInitialState, IdNameEntity, SimpleEntityStore, simpleInitialState, wait } from '../util-test';
import { TestBed } from '@angular/core/testing';
import { EntityStore } from './entity-store';
import { EntityState } from '../type';
import { StStoreModule } from '../st-store.module';

describe('Entity Store', () => {
  let store: SimpleEntityStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StStoreModule.forRoot()],
      providers: [SimpleEntityStore],
    });
    store = TestBed.inject(SimpleEntityStore);
  });

  it('should create the store', () => {
    expect(store).toBeDefined();
    expect(store.getState()).toBeDefined();
    expect(store.getState().entities.length).toBe(1);
    expect(store.getState().entities.values).toEqual(entityInitialState());
  });

  it('should use custom merge function', () => {
    const newStore = new EntityStore<EntityState<IdNameEntity>>({
      name: 'test',
      initialState: { entities: entityInitialState() },
      mergeFn: (a, b) => ({ ...b, ...a }),
    });
    newStore.updateEntity(1, { name: '2' });
    expect(newStore.getState().entities.get(1)?.name).toBe('Guilherme');
  });

  it('should set the state', () => {
    const newState = [{ id: 1, name: '1' }];
    store.setEntities(newState);
    expect(store.getState().entities.length).toBe(1);
    expect(store.getState().entities.values).toEqual(newState);
  });

  it('should add (one)', () => {
    const newItem = { id: 2, name: '2' };
    store.add(newItem);
    expect(store.getState().entities.length).toBe(2);
    expect(store.getState().entities.values).toEqual([...entityInitialState(), newItem]);
  });

  it('should add (many)', () => {
    const newItems = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItems);
    expect(store.getState().entities.length).toBe(3);
    expect(store.getState().entities.values).toEqual([...entityInitialState(), ...newItems]);
  });

  it('should remove (id)', () => {
    const newItem = { id: 2, name: '2' };
    store.add(newItem);
    expect(store.getState().entities.length).toBe(2);
    store.remove(1);
    expect(store.getState().entities.length).toBe(1);
    expect(store.getState().entities.values).toEqual([newItem]);
  });

  it('should remove (ids)', () => {
    const newItems = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItems);
    expect(store.getState().entities.length).toBe(3);
    store.remove([1, 2]);
    expect(store.getState().entities.length).toBe(1);
    expect(store.getState().entities.values).toEqual([newItems[1]]);
  });

  it('should remove (callback)', () => {
    const newItem = { id: 2, name: '2' };
    store.add(newItem);
    expect(store.getState().entities.length).toBe(2);
    store.remove(entity => entity.name === '2');
    expect(store.getState().entities.length).toBe(1);
    expect(store.getState().entities.values).toEqual(entityInitialState());
  });

  it('should update (id)', () => {
    store.updateEntity(1, { name: 'Guilherme' });
    expect(store.getState().entities.get(1)?.name).toBe('Guilherme');
    store.updateEntity(1, entity => ({ ...entity, name: '1' }));
    expect(store.getState().entities.get(1)?.name).toBe('1');
  });

  it('should update (callback)', () => {
    store.add({ id: 2, name: simpleInitialState().name });
    store.updateEntity(entity => entity.name === simpleInitialState().name, { name: 'T' });
    expect(store.getState().entities.length).toBe(2);
    expect(store.getState().entities.values).toEqual([
      { id: 1, name: 'T' },
      { id: 2, name: 'T' },
    ]);
    store.updateEntity(entity => entity.name === 'T', { name: 'U' });
    expect(store.getState().entities.values).toEqual([
      { id: 1, name: 'U' },
      { id: 2, name: 'U' },
    ]);
  });

  it('should not update', () => {
    store.updateEntity(4, { name: '1' });
    expect(store.getState().entities.length).toBe(1);

    store.updateEntity(entity => entity.name === 'NOT EXISTS', { name: '1' });
    expect(store.getState().entities.length).toBe(1);
  });

  it('should upsert (one)', () => {
    store.upsert(1, { id: 1, name: 'U' });
    expect(store.getState().entities.length).toBe(1);
    expect(store.getState().entities.get(1)).toEqual({ id: 1, name: 'U' });
    store.upsert(2, { id: 2, name: '2' });
    expect(store.getState().entities.length).toBe(2);
    expect(store.getState().entities.get(2)).toEqual({ id: 2, name: '2' });
  });

  it('should upsert (many)', () => {
    store.upsert([
      { id: 1, other: 'T' },
      { id: 2, name: '2' },
    ]);
    expect(store.getState().entities.length).toBe(2);
    expect(store.getState().entities.values).toEqual([
      { id: 1, name: 'Guilherme', other: 'T' },
      { id: 2, name: '2' },
    ]);
  });

  it('should not upsert many if id is null or undefined', () => {
    store.upsert([{ name: '1' }]);
    expect(store.getState().entities.length).toBe(1);
    expect(store.getState().entities.get(1)).toEqual(simpleInitialState());
    expect(store.getState().entities.some(entity => entity.name === '1')).toBeFalse();
  });

  it('should set active (id)', () => {
    store.add([
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ]);
    store.setActive(1);
    expect(store.getState().activeKeys.size).toBe(1);
    expect(store.getState().activeKeys.has(1)).toBeTrue();
  });

  it('should set active (entity)', () => {
    const newItems = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItems);
    store.setActive(newItems[0]);
    expect(store.getState().activeKeys.size).toBe(1);
    expect(store.getState().activeKeys.has(2)).toBeTrue();
  });

  it('should set active (many id)', () => {
    const newItems = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItems);
    store.setActive([1, 2]);
    expect(store.getState().activeKeys.size).toBe(2);
    expect(store.getState().activeKeys.has(1)).toBeTrue();
    expect(store.getState().activeKeys.has(2)).toBeTrue();
  });

  it('should add active (id)', () => {
    store.add({ id: 2, name: '2' });
    store.addActive(1);
    expect(store.getState().activeKeys.size).toBe(1);
    expect(store.getState().activeKeys.has(1)).toBeTrue();
    store.addActive(2);
    expect(store.getState().activeKeys.size).toBe(2);
    expect(store.getState().activeKeys.has(1)).toBeTrue();
    expect(store.getState().activeKeys.has(2)).toBeTrue();
  });

  it('should add active (entity)', () => {
    store.add({ id: 2, name: '2' });
    store.addActive(simpleInitialState());
    expect(store.getState().activeKeys.size).toBe(1);
    expect(store.getState().activeKeys.has(1)).toBeTrue();
    store.addActive(store.getState().entities.get(2)!);
    expect(store.getState().activeKeys.size).toBe(2);
    expect(store.getState().activeKeys.has(1)).toBeTrue();
    expect(store.getState().activeKeys.has(2)).toBeTrue();
  });

  it('should add active (many id)', () => {
    const newItems = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItems);
    store.addActive([1, 2]);
    expect(store.getState().activeKeys.size).toBe(2);
    expect(store.getState().activeKeys.has(1)).toBeTrue();
    expect(store.getState().activeKeys.has(2)).toBeTrue();
  });

  it('should add active (many entity)', () => {
    const newItems = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItems);
    store.addActive([simpleInitialState(), newItems[0]]);
    expect(store.getState().activeKeys.size).toBe(2);
    expect(store.getState().activeKeys.has(1)).toBeTrue();
    expect(store.getState().activeKeys.has(2)).toBeTrue();
  });

  it('should remove active (removeActive)', () => {
    const newItems = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItems);
    store.addActive(1);
    expect(store.getState().activeKeys.has(1)).toBeTrue();
    store.removeActive(1);
    expect(store.getState().activeKeys.has(1)).toBeFalse();
    store.addActive([1, 2, 3]);
    expect(store.getState().activeKeys.size).toBe(3);
    store.removeActive([1, 2]);
    expect(store.getState().activeKeys.size).toBe(1);
  });

  it('should remove active (remove)', () => {
    const newItems = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItems);
    store.addActive([1, 2]);
    expect(store.getState().activeKeys.size).toBe(2);
    store.remove(1);
    expect(store.getState().activeKeys.size).toBe(1);
    expect(store.getState().activeKeys.has(1)).toBeFalse();
    expect(store.getState().activeKeys.has(2)).toBeTrue();
  });

  it('should toggle the active', () => {
    const newItems = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItems);
    store.toggleActive(1);
    expect(store.getState().activeKeys.has(1)).toBeTrue();
    store.toggleActive(1);
    expect(store.getState().activeKeys.has(1)).toBeFalse();
    store.toggleActive(newItems[0]);
    expect(store.getState().activeKeys.has(2)).toBeTrue();
    store.toggleActive(newItems[0]);
    expect(store.getState().activeKeys.has(2)).toBeFalse();
  });

  it('should remove the entities (removeActiveEntities)', () => {
    const newItems = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItems);
    store.addActive(1);
    expect(store.getState().activeKeys.has(1)).toBeTrue();
    expect(store.getState().entities.has(1)).toBeTrue();
    store.removeActiveEntities();
    expect(store.getState().entities.has(1)).toBeFalse();
    expect(store.getState().activeKeys.has(1)).toBeFalse();
    expect(store.getState().entities.length).toBe(2);
  });

  it('should replace', () => {
    store.updateEntity(1, { other: '1' });
    expect(store.getState().entities.get(1)).toEqual({ id: 1, name: 'Guilherme', other: '1' });
    store.replace(1, { id: 1, name: '1' });
    expect(store.getState().entities.get(1)).toEqual({ id: 1, name: '1' });
    expect(store.getState().entities.get(1)?.other).toBeUndefined();
  });

  it('should reset', () => {
    store.upsert([
      { id: 1, other: 'A' },
      { id: 2, name: 'B' },
    ]);
    store.addActive(1);
    expect(store.getState().entities.values).toEqual([
      { id: 1, name: 'Guilherme', other: 'A' },
      { id: 2, name: 'B' },
    ]);
    expect(store.getState().activeKeys.has(1)).toBeTrue();
    store.reset();
    expect(store.getState().entities.values).toEqual(entityInitialState());
    expect(store.getState().activeKeys.has(1)).toBeFalse();
  });

  it('should pass through preAdd', () => {
    spyOn(store, 'preAddEntity').and.callThrough();
    store.add({ id: 2, name: '2' });
    store.upsert(3, { id: 3, name: '3' });
    expect(store.preAddEntity).toHaveBeenCalledTimes(2);
    store.add([
      { id: 4, name: '4' },
      { id: 5, name: '5' },
    ]);
    store.upsert([
      { id: 4, name: '4two' },
      { id: 6, name: '6' },
    ]);
    expect(store.preAddEntity).toHaveBeenCalledTimes(5);
  });

  it('should pass through preUpdateEntity', () => {
    spyOn(store, 'preUpdateEntity').and.callThrough();
    store.updateEntity(1, { name: '1' });
    store.upsert([
      {
        id: 1,
        name: '2',
      },
      { id: 2, name: '2' },
    ]);
    expect(store.preUpdateEntity).toHaveBeenCalledTimes(2);
    store.upsert([
      { id: 1, name: '1' },
      { id: 2, name: '32' },
    ]);
    expect(store.preUpdateEntity).toHaveBeenCalledTimes(4);
  });

  it('should have cache', async () => {
    store.setHasCache(true);
    expect(store.hasCache()).toBeTrue();
    await wait(15);
    expect(store.hasCache()).toBeFalse();
  });

  it('should not have cache', () => {
    const newStore = new EntityStore({ name: 'test' });
    newStore.setHasCache(true);
    expect(store.hasCache()).toBeFalse();
  });

  it('should map', () => {
    const newItems = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItems);
    store.map((entity, key) => {
      if (key === 1) {
        return { ...entity, name: '1' };
      } else {
        return { ...entity, name: '5' };
      }
    });
    expect(store.getState().entities.get(1)?.name).toBe('1');
    expect(store.getState().entities.get(2)?.name).toBe('5');
    expect(store.getState().entities.get(3)?.name).toBe('5');
  });

  it('should update the state (partial)', () => {
    store.updateState({ loadingNames: true });
    expect(store.getState().loadingNames).toBe(true);
  });

  it('should update the state (callback)', () => {
    store.updateState(state => ({
      ...state,
      list: [1, 2, 3],
    }));
    expect(store.getState().list).toEqual([1, 2, 3]);
  });

  it('should create store without initialState', () => {
    const newStore = new EntityStore<EntityState<IdNameEntity>>({ name: 'test', idGetter: 'id' });
    expect(newStore.getState().entities.length).toBe(0);
  });

  it('should create with object initialState', () => {
    const newStore = new EntityStore<EntityState<IdNameEntity>>({
      name: 'test',
      idGetter: 'id',
      initialState: { entities: { 1: { id: 1, name: 'Guilherme' } } },
    });
    expect(newStore.getState().entities.length).toBe(1);
    expect(newStore.getState().entities.has(1)).toBeTrue();
    expect(newStore.getState().entities.get(1)).toBeDefined();
  });

  it('should create with initial active', () => {
    const newStore = new EntityStore<EntityState<IdNameEntity>>({
      name: 'test',
      idGetter: 'id',
      initialState: { entities: { 1: { id: 1, name: 'Guilherme' }, 2: { id: 2, name: 'Guilherme2' } } },
      initialActive: [1, 2],
    });
    expect(newStore.getState().activeKeys.has(1)).toBeTrue();
    expect(newStore.getState().activeKeys.has(2)).toBeTrue();
  });

  it(`should not set initial active that doesn't exists`, () => {
    const newStore = new EntityStore<EntityState<IdNameEntity>>({
      name: 'test',
      idGetter: 'id',
      initialState: { entities: { 1: { id: 1, name: 'Guilherme' } } },
      initialActive: [1, 2],
    });
    expect(newStore.getState().activeKeys.has(1)).toBeTrue();
    expect(newStore.getState().activeKeys.has(2)).toBeFalse();
  });

  it('should not set initial state', () => {
    const newStore = new EntityStore<EntityState<IdNameEntity>>({ name: 'test-test', initialState: {} });
    expect(newStore.getState().entities.length).toBe(0);
  });

  it('should dev copy', () => {
    const newStore = new SimpleEntityStore();
    newStore.updateState({ loadingNames: true });
    const entity = newStore.getState().entities.get(1)!;
    expect(Object.isFrozen(entity)).toBeTrue();
    expect(() => (entity.name = '1')).toThrow();
  });

  it('should set loading', () => {
    store.setLoading(true);
    expect(store.getLoading()).toBeTrue();
    store.setLoading(false);
    expect(store.getLoading()).toBeFalse();
  });

  it('should set error', () => {
    store.setError({ code: 1 });
    expect(store.getError()?.code).toBe(1);
    store.setError(null);
    expect(store.getError()).toBeNull();
  });
});
