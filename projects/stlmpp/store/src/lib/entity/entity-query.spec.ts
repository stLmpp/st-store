import { SimpleEntityQuery, SimpleEntityStore, simpleInitialState } from '../utils-test';
import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';

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
    store.update(1, { name: '1' });
    expect(subscriber1).toHaveBeenCalledTimes(2);
    query
      .selectEntity(1)
      .pipe(take(1))
      .subscribe(entity => {
        expect(entity).toBeDefined();
        expect(entity).toEqual({ id: 1, name: '1' });
      });
    query
      .selectEntity(1, 'name')
      .pipe(take(1))
      .subscribe(name => {
        expect(name).toBeDefined();
        expect(name).toBe('1');
      });
    const subscriber2 = jasmine.createSpy('subscriber2');
    query.selectEntity(1, 'name').subscribe(subscriber2);
    store.update(1, { other: '1' });
    expect(subscriber2).toHaveBeenCalledTimes(1);
    expect(subscriber1).toHaveBeenCalledTimes(3);
    query
      .selectEntity(entity => entity.id === 1)
      .pipe(take(1))
      .subscribe(entity => {
        expect(entity).toBeDefined();
        expect(entity).toEqual({ id: 1, name: '1', other: '1' });
      });
  });

  it('should get entity', () => {
    const entity = query.getEntity(1);
    expect(entity).toEqual(simpleInitialState);
    const name = query.getEntity(1, 'name');
    expect(name).toBe('Guilherme');
  });

  it('should select many', () => {
    store.add([
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ]);
    const subscriber1 = jasmine.createSpy('subscriber1');
    query.selectMany([1, 2]).subscribe(subscriber1);
    store.update(1, { other: '1' });
    store.update(3, { other: '3' });
    expect(subscriber1).toHaveBeenCalledTimes(2);
    query
      .selectMany([1, 2])
      .pipe(take(1))
      .subscribe(entities => {
        expect(entities.length).toBe(2);
        expect(entities).toEqual([
          { id: 1, name: 'Guilherme', other: '1' },
          { id: 2, name: '2' },
        ]);
      });
    query
      .selectMany(entity => /^([13])$/.test(entity?.other ?? ''))
      .pipe(take(1))
      .subscribe(entities => {
        expect(entities.length).toBe(2);
        expect(entities).toEqual([
          { id: 1, name: 'Guilherme', other: '1' },
          { id: 3, name: '3', other: '3' },
        ]);
      });
  });

  it('should not emit if equal entity', () => {
    const subscriber = jasmine.createSpy('subscriber');
    query.selectEntity(1).subscribe(subscriber);
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.add({ id: 5, name: '5' });
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.update(5, { other: '2' });
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.upsert([
      { id: 1, other: '2' },
      { id: 5, other: '67' },
    ]);
    expect(subscriber).toHaveBeenCalledTimes(2);
    store.remove(1);
    expect(subscriber).toHaveBeenCalledTimes(3);
  });

  it('should not emit if equal entites', () => {
    store.set([
      { id: 1, name: '1' },
      { id: 2, name: '2' },
    ]);
    const subscriber = jasmine.createSpy('subscriber');
    query.selectMany([1, 2]).subscribe(subscriber);
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.add({ id: 3, name: '3' });
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.update(3, { other: '3' });
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.remove(3);
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.upsert([{ id: 1, name: '1' }]);
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.upsert([{ id: 1, other: '1' }]);
    expect(subscriber).toHaveBeenCalledTimes(2);
  });

  it('should not emit if equal active ids', () => {
    store.set([
      { id: 1, name: '1' },
      { id: 2, name: '2' },
    ]);
    store.setActive(1);
    const subscriber = jasmine.createSpy('subscriber');
    query.activeId$.subscribe(subscriber);
    expect(subscriber).toHaveBeenCalledTimes(1);
    store.addActive(2);
    expect(subscriber).toHaveBeenCalledTimes(2);
    store.remove(1);
    expect(subscriber).toHaveBeenCalledTimes(3);
  });
});
