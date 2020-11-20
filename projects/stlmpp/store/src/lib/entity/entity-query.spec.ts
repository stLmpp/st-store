import { entityInitialState, SimpleEntityQuery, SimpleEntityStore, simpleInitialState, wait } from '../util-test';
import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';
import { isEqualEntitiesFactory, isEqualEntity } from './entity-query';

describe('Entity Query', () => {
  let query: SimpleEntityQuery;
  let store: SimpleEntityStore;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SimpleEntityStore, SimpleEntityQuery],
    });
    query = TestBed.inject(SimpleEntityQuery);
    store = TestBed.inject(SimpleEntityStore);
  });

  it('should create query', () => {
    expect(query).toBeDefined();
    expect(store).toBeDefined();
    expect(query.getAll()).toBeDefined();
  });

  it('should verify if exists', () => {
    expect(query.exists(1)).toBeTrue();
    expect(query.exists([1])).toBeTrue();
    expect(query.exists(entity => entity.id === 1)).toBeTrue();
    expect(query.exists(2)).toBeFalse();
    expect(query.exists([2])).toBeFalse();
    expect(query.exists(entity => entity.id === 2)).toBeFalse();
    expect(query.exists([2, 1])).toBeTrue();
  });

  it('should verify if has any active', () => {
    expect(query.hasActive()).toBeFalse();
    store.setActive(1);
    expect(query.hasActive()).toBeTrue();
  });

  it('should select entity', () => {
    const subscriber1 = jasmine.createSpy('subscriber1');
    query.selectEntity(1).subscribe(subscriber1);
    store.add({ id: 2, name: '2' });
    expect(subscriber1).toHaveBeenCalledTimes(1);
    store.updateEntity(1, { name: '1' });
    expect(subscriber1).toHaveBeenCalledTimes(2);
    expect(subscriber1).toHaveBeenCalledWith({ id: 1, name: '1' });
    const subscriberName1 = jasmine.createSpy('subscriberName1');
    query.selectEntity(1, 'name').subscribe(subscriberName1);
    expect(subscriberName1).toHaveBeenCalledWith('1');
    const subscriber2 = jasmine.createSpy('subscriber2');
    query.selectEntity(1, 'name').subscribe(subscriber2);
    store.updateEntity(1, { other: '1' });
    expect(subscriber2).toHaveBeenCalledTimes(1);
    expect(subscriber1).toHaveBeenCalledTimes(3);
    expect(subscriber1).toHaveBeenCalledWith({ id: 1, name: '1', other: '1' });
  });

  it('should select entity with callback', () => {
    store.setEntities([{ id: 1, name: '1' }]);
    const sub = jasmine.createSpy();
    query.selectEntity(entity => entity.id === 1).subscribe(sub);
    expect(sub).toHaveBeenCalledWith({ id: 1, name: '1' });
  });

  it('should select partial entity', () => {
    store.setEntities([{ id: 1, name: '1' }]);
    const sub = jasmine.createSpy();
    query.selectEntity(1, 'name').subscribe(sub);
    expect(sub).toHaveBeenCalledWith('1');
  });

  it('should select undefined if entity does not exists', () => {
    const subEntity = jasmine.createSpy();
    query.selectEntity(113).subscribe(subEntity);
    expect(subEntity).toHaveBeenCalledWith(undefined);
    const subProperty = jasmine.createSpy();
    query.selectEntity(113, 'name').subscribe(subProperty);
    expect(subEntity).toHaveBeenCalledWith(undefined);
  });

  it('should get entity', () => {
    const entity = query.getEntity(1);
    expect(entity).toEqual(simpleInitialState());
    const name = query.getEntity(1, 'name');
    expect(name).toBe('Guilherme');
    expect(query.getEntity(123, 'name')).toBeUndefined();
  });

  it('should select many', () => {
    store.add([
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ]);
    const subscriber1 = jasmine.createSpy('subscriber1');
    query.selectMany([1, 2]).subscribe(subscriber1);
    store.updateEntity(1, { other: '1' });
    store.updateEntity(3, { other: '3' });
    expect(subscriber1).toHaveBeenCalledTimes(2);
    expect(subscriber1).toHaveBeenCalledWith([
      { id: 1, name: 'Guilherme', other: '1' },
      { id: 2, name: '2' },
    ]);
  });

  it('should select many with callback', () => {
    store.add([
      { id: 2, name: '2' },
      { id: 3, name: '2' },
    ]);
    const sub = jasmine.createSpy();
    query.selectMany(entity => entity.name === '2').subscribe(sub);
    expect(sub).toHaveBeenCalledWith([
      { id: 2, name: '2' },
      { id: 3, name: '2' },
    ]);
  });

  it('should not emit if equal entity', () => {
    const subscriber = jasmine.createSpy('subscriber');
    query.selectEntity(1).subscribe(subscriber);
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.add({ id: 5, name: '5' });
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.updateEntity(5, { other: '2' });
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.upsert([
      { id: 1, other: '2' },
      { id: 5, other: '67' },
    ]);
    expect(subscriber).toHaveBeenCalledTimes(2);
    store.remove(1);
    expect(subscriber).toHaveBeenCalledTimes(3);
  });

  it('should not emit if equal entities', () => {
    store.setEntities([
      { id: 1, name: '1' },
      { id: 2, name: '2' },
    ]);
    const subscriber = jasmine.createSpy('subscriber');
    query.selectMany([1, 2]).subscribe(subscriber);
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.add({ id: 3, name: '3' });
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.updateEntity(3, { other: '3' });
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.remove(3);
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.upsert([{ id: 1, name: '1' }]);
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.upsert([{ id: 1, other: '1' }]);
    expect(subscriber).toHaveBeenCalledTimes(2);
  });

  it('should not emit if equal active ids', () => {
    store.setEntities([
      { id: 1, name: '1' },
      { id: 2, name: '2' },
    ]);
    store.setActive(1);
    const subscriber = jasmine.createSpy('subscriber');
    query.activeIds$.subscribe(subscriber);
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.addActive(2);
    expect(subscriber).toHaveBeenCalledTimes(2);
    store.remove(1);
    expect(subscriber).toHaveBeenCalledTimes(3);
  });

  it('should update the active', () => {
    store.setEntities([
      { id: 1, name: '1' },
      { id: 2, name: '2' },
    ]);
    store.setActive(1);
    const sub = jasmine.createSpy();
    query.active$.subscribe(sub);
    expect(sub).toHaveBeenCalledWith([{ id: 1, name: '1' }]);
    store.addActive(2);
    expect(sub).toHaveBeenCalledWith([
      { id: 1, name: '1' },
      { id: 2, name: '2' },
    ]);
  });

  it('should emit if active is updated', () => {
    store.setEntities([
      { id: 1, name: '1' },
      { id: 2, name: '2' },
    ]);
    store.setActive([1, 2]);
    const subscriber = jasmine.createSpy('subscriber');
    query.active$.subscribe(subscriber);
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.updateEntity(1, { name: '2' });
    expect(subscriber).toHaveBeenCalledTimes(2);
    store.add({ name: '3', id: 3 });
    expect(subscriber).toHaveBeenCalledTimes(2);
    store.remove(2);
    expect(subscriber).toHaveBeenCalledTimes(3);
    store.updateEntity(3, { other: '3' });
    expect(subscriber).toHaveBeenCalledTimes(3);
  });

  it('should define if entity is equal', () => {
    expect(isEqualEntity({ id: 1, nome: 'Guilherme' }, { nome: 'Guilherme', id: 1 })).toBeTrue();
    const entity = { id: 2 };
    expect(isEqualEntity(entity, entity)).toBeTrue();
    expect(isEqualEntity(entity, undefined)).toBeFalse();
    expect(isEqualEntity(undefined, entity)).toBeFalse();
  });

  it('should distinct if entities are equal', () => {
    const comparator = isEqualEntitiesFactory(isEqualEntity);
    const entitiesA = [{ id: 1, nome: 'Guilherme' }];
    const entitiesB = [{ nome: 'Guilherme', id: 1 }];
    expect(comparator(entitiesA, entitiesB)).toBeTrue();
    expect(comparator(entitiesA, entitiesA)).toBeTrue();
    expect(comparator(entitiesA, undefined as any)).toBeFalse();
    expect(comparator(undefined as any, entitiesA)).toBeFalse();
    expect(comparator(entitiesA, []));
    expect(comparator([], entitiesA));
    expect(comparator([...entitiesA], [...entitiesB])).toBeTrue();
    expect(comparator([...entitiesA, { id: 2, nome: 'Guilherme2' }], entitiesB)).toBeFalse();
  });

  it('should return all entities', () => {
    const sub = jasmine.createSpy();
    query.all$.subscribe(sub);
    expect(sub).toHaveBeenCalledWith(entityInitialState());
  });

  it('should return all active', () => {
    store.setActive(1);
    const active = query.getActive();
    expect(active).toBeDefined();
    expect(active.length).toBe(1);
    expect(active).toEqual(entityInitialState());
  });

  it('should return the loading state', () => {
    expect(query.getLoading()).toBeFalse();
    store.setLoading(true);
    expect(query.getLoading()).toBeTrue();
  });

  it('should return the error state', () => {
    expect(query.getError()).toBeNull();
    store.setError({ code: 1 });
    expect(query.getError()).toEqual({ code: 1 });
  });

  it('should return the cache state', async () => {
    store.setHasCache(true);
    expect(query.getHasCache()).toBeTrue();
    await wait(15);
    expect(query.getHasCache()).toBeFalse();
  });

  it('should select the state', done => {
    query
      .select()
      .pipe(take(1))
      .subscribe(state => {
        expect(state).toBeDefined();
        expect(state.entities.length).toBe(1);
        done();
      });
  });

  it('should select loading', done => {
    query.loading$.pipe(take(1)).subscribe(loading => {
      expect(loading).toBeFalse();
      done();
    });
  });

  it('should return if has active', () => {
    const sub = jasmine.createSpy();
    query.hasActive$.subscribe(sub);
    expect(sub).toHaveBeenCalledTimes(1);
    expect(sub).toHaveBeenCalledWith(false);
    store.setActive(1);
    expect(sub).toHaveBeenCalledTimes(2);
    expect(sub).toHaveBeenCalledWith(true);
  });

  describe('selectAll', () => {
    it('should select all without options', () => {
      const sub = jasmine.createSpy();
      query.selectAll().subscribe(sub);
      expect(sub).toHaveBeenCalledWith(entityInitialState());
    });

    it('should select all ordered', () => {
      store.setEntities([
        { id: 2, name: '2' },
        { id: 1, name: '1' },
      ]);
      const sub = jasmine.createSpy();
      query.selectAll({ orderBy: 'id' }).subscribe(sub);
      expect(sub).toHaveBeenCalledWith([
        { id: 1, name: '1' },
        { id: 2, name: '2' },
      ]);
    });

    it('should select all filtered [key, value]', () => {
      store.setEntities([
        { id: 1, name: '1' },
        { id: 2, name: '2' },
      ]);
      const sub = jasmine.createSpy();
      query.selectAll({ filterBy: ['name', '2'] }).subscribe(sub);
      expect(sub).toHaveBeenCalledWith([{ id: 2, name: '2' }]);
    });

    it('should select all filtered', () => {
      store.setEntities([
        { id: 1, name: '1' },
        { id: 2, name: '2' },
      ]);
      const sub = jasmine.createSpy();
      query.selectAll({ filterBy: entity => entity.id === 1 }).subscribe(sub);
      expect(sub).toHaveBeenCalledWith([{ id: 1, name: '1' }]);
    });

    it('should select all with limit', done => {
      store.setEntities(Array.from({ length: 100 }).map((_, index) => ({ id: index, name: '' + index })));
      query.selectAll({ limit: 10 }).subscribe(entities => {
        expect(entities.length).toBe(10);
        expect(entities[0]).toEqual({ id: 0, name: '0' });
        expect(entities[entities.length - 1]).toEqual({ id: 9, name: '9' });
        done();
      });
    });

    it('should not limit if 0', done => {
      store.setEntities(Array.from({ length: 100 }).map((_, index) => ({ id: index, name: '' + index })));
      query.selectAll({ limit: 0 }).subscribe(entities => {
        expect(entities.length).toBe(100);
        done();
      });
    });

    it('should not limit if less than 0', done => {
      store.setEntities(Array.from({ length: 100 }).map((_, index) => ({ id: index, name: '' + index })));
      query.selectAll({ limit: -1 }).subscribe(entities => {
        expect(entities.length).toBe(100);
        done();
      });
    });
  });
});
