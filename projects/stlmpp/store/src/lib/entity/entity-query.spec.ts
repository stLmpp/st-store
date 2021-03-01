import { entityInitialState, SimpleEntityQuery, SimpleEntityStore, simpleInitialState, wait } from '../util-test';
import { TestBed } from '@angular/core/testing';
import { map, take } from 'rxjs/operators';
import { isEqualEntity } from './entity-query';

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
    query
      .selectMany([1, 2])
      .pipe(map(o => o.values))
      .subscribe(subscriber1);
    store.updateEntity(1, { other: '1' });
    store.updateEntity(3, { other: '3' });
    expect(subscriber1).toHaveBeenCalledTimes(3);
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
    query
      .selectMany(entity => entity.name === '2')
      .pipe(map(o => o.values))
      .subscribe(sub);
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
    query.active$.pipe(map(o => o.values)).subscribe(sub);
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
    expect(subscriber).toHaveBeenCalledTimes(3);
    store.remove(2);
    expect(subscriber).toHaveBeenCalledTimes(4);
    store.updateEntity(3, { other: '3' });
    expect(subscriber).toHaveBeenCalledTimes(5);
  });

  it('should define if entity is equal', () => {
    expect(isEqualEntity({ id: 1, nome: 'Guilherme' }, { nome: 'Guilherme', id: 1 })).toBeTrue();
    const entity = { id: 2 };
    expect(isEqualEntity(entity, entity)).toBeTrue();
    expect(isEqualEntity(entity, undefined)).toBeFalse();
    expect(isEqualEntity(undefined, entity)).toBeFalse();
  });

  it('should return all entities', done => {
    query.all$.subscribe(all => {
      expect(all.values).toEqual(entityInitialState());
      done();
    });
  });

  it('should return all active', () => {
    store.setActive(1);
    const active = query.getActive();
    expect(active).toBeDefined();
    expect(active.length).toBe(1);
    expect(active.values).toEqual(entityInitialState());
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
      query
        .selectAll()
        .pipe(map(o => o.values))
        .subscribe(sub);
      expect(sub).toHaveBeenCalledWith(entityInitialState());
    });

    it('should select all ordered', done => {
      store.setEntities([
        { id: 2, name: '2' },
        { id: 1, name: '1' },
      ]);
      query.selectAll({ orderBy: 'id' }).subscribe(all => {
        expect(all.values).toEqual([
          { id: 1, name: '1' },
          { id: 2, name: '2' },
        ]);
        done();
      });
    });

    it('should select all filtered [key, value]', done => {
      store.setEntities([
        { id: 1, name: '1' },
        { id: 2, name: '2' },
      ]);
      query.selectAll({ filterBy: ['name', '2'] }).subscribe(all => {
        expect(all.values).toEqual([{ id: 2, name: '2' }]);
        done();
      });
    });

    it('should select all filtered', done => {
      store.setEntities([
        { id: 1, name: '1' },
        { id: 2, name: '2' },
      ]);
      query.selectAll({ filterBy: entity => entity.id === 1 }).subscribe(all => {
        expect(all.values).toEqual([{ id: 1, name: '1' }]);
        done();
      });
    });
  });
});
