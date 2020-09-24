import { entityInitialState, SimpleEntityStore, simpleInitialState } from '../utils-test';
import { TestBed } from '@angular/core/testing';
import { take } from 'rxjs/operators';

describe('Entity Store', () => {
  let store: SimpleEntityStore;

  const takeOne = () => store.selectState().pipe(take(1));

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SimpleEntityStore],
    });
    store = TestBed.inject(SimpleEntityStore);
  });

  it('should create the store', () => {
    expect(store).toBeDefined();
    expect(store.getState()).toBeDefined();
    expect(store.getState().entities.length).toBe(1);
    expect(store.getState().entities.values).toEqual(entityInitialState);
    takeOne().subscribe(state => {
      expect(state.entities.values).toEqual(entityInitialState);
    });
  });

  it('should set the state', () => {
    const newState = [{ id: 1, name: '1' }];
    store.set(newState);
    expect(store.getState().entities.length).toBe(1);
    expect(store.getState().entities.values).toEqual(newState);
    takeOne().subscribe(state => {
      expect(state.entities.values).toEqual(newState);
    });
  });

  it('should add (one)', () => {
    const newItem = { id: 2, name: '2' };
    store.add(newItem);
    expect(store.getState().entities.length).toBe(2);
    expect(store.getState().entities.values).toEqual([...entityInitialState, newItem]);
    takeOne().subscribe(state => {
      expect(state.entities.values).toEqual([...entityInitialState, newItem]);
    });
  });

  it('should add (many)', () => {
    const newItens = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItens);
    expect(store.getState().entities.length).toBe(3);
    expect(store.getState().entities.values).toEqual([...entityInitialState, ...newItens]);
    takeOne().subscribe(state => {
      expect(state.entities.values).toEqual([...entityInitialState, ...newItens]);
    });
  });

  it('should remove (id)', () => {
    const newItem = { id: 2, name: '2' };
    store.add(newItem);
    expect(store.getState().entities.length).toBe(2);
    store.remove(1);
    expect(store.getState().entities.length).toBe(1);
    expect(store.getState().entities.values).toEqual([newItem]);
    takeOne().subscribe(state => {
      expect(state.entities.values).toEqual([newItem]);
    });
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
    takeOne().subscribe(state => {
      expect(state.entities.values).toEqual([newItems[1]]);
    });
  });

  it('shoud remove (callback)', () => {
    const newItem = { id: 2, name: '2' };
    store.add(newItem);
    expect(store.getState().entities.length).toBe(2);
    store.remove(entity => entity.name === '2');
    expect(store.getState().entities.length).toBe(1);
    expect(store.getState().entities.values).toEqual(entityInitialState);
    takeOne().subscribe(state => {
      expect(state.entities.values).toEqual(entityInitialState);
    });
  });

  it('should update (id)', () => {
    store.update(1, { name: 'Guilherme' });
    expect(store.getState().entities.get(1).name).toBe('Guilherme');
    takeOne().subscribe(state => {
      expect(state.entities.get(1).name).toBe('Guilherme');
    });
    store.update(1, entity => ({ ...entity, name: '1' }));
    expect(store.getState().entities.get(1).name).toBe('1');
    takeOne().subscribe(state => {
      expect(state.entities.get(1).name).toBe('1');
    });
  });

  it('should update (callback)', () => {
    store.add({ id: 2, name: simpleInitialState.name });
    store.update(entity => entity.name === simpleInitialState.name, { name: 'T' });
    expect(store.getState().entities.length).toBe(2);
    expect(store.getState().entities.values).toEqual([
      { id: 1, name: 'T' },
      { id: 2, name: 'T' },
    ]);
    takeOne().subscribe(state => {
      expect(state.entities.values).toEqual([
        { id: 1, name: 'T' },
        { id: 2, name: 'T' },
      ]);
    });
    store.update(entity => entity.name === 'T', { name: 'U' });
    expect(store.getState().entities.values).toEqual([
      { id: 1, name: 'U' },
      { id: 2, name: 'U' },
    ]);
    takeOne().subscribe(state => {
      expect(state.entities.values).toEqual([
        { id: 1, name: 'U' },
        { id: 2, name: 'U' },
      ]);
    });
  });

  it('should upsert (one)', () => {
    store.upsert(1, { id: 1, name: 'U' });
    expect(store.getState().entities.length).toBe(1);
    expect(store.getState().entities.get(1)).toEqual({ id: 1, name: 'U' });
    takeOne().subscribe(state => {
      expect(state.entities.get(1)).toEqual({ id: 1, name: 'U' });
    });
    store.upsert(2, { id: 2, name: '2' });
    expect(store.getState().entities.length).toBe(2);
    expect(store.getState().entities.get(2)).toEqual({ id: 2, name: '2' });
    takeOne().subscribe(state => {
      expect(state.entities.get(2)).toEqual({ id: 2, name: '2' });
    });
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
    takeOne().subscribe(state => {
      expect(state.entities.values).toEqual([
        { id: 1, name: 'Guilherme', other: 'T' },
        { id: 2, name: '2' },
      ]);
    });
  });

  it('should set active (id)', () => {
    store.add([
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ]);
    store.setActive(1);
    expect(store.getState().active.length).toBe(1);
    expect(store.getState().active.has(1)).toBeTrue();
    expect(store.getState().active.get(1)).toBeDefined();
    takeOne().subscribe(state => {
      expect(state.active.length).toBe(1);
      expect(state.active.has(1)).toBeTrue();
      expect(state.active.get(1)).toBeDefined();
    });
  });

  it('should set active (entity)', () => {
    const newItens = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItens);
    store.setActive(newItens[0]);
    expect(store.getState().active.length).toBe(1);
    expect(store.getState().active.has(2)).toBeTrue();
    expect(store.getState().active.get(2)).toBeDefined();
    takeOne().subscribe(state => {
      expect(state.active.length).toBe(1);
      expect(state.active.has(2)).toBeTrue();
      expect(state.active.get(2)).toBeDefined();
    });
  });

  it('should set active (many id)', () => {
    const newItens = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItens);
    store.setActive([1, 2]);
    expect(store.getState().active.length).toBe(2);
    expect(store.getState().active.has(1)).toBeTrue();
    expect(store.getState().active.get(1)).toBeDefined();
    expect(store.getState().active.has(2)).toBeTrue();
    expect(store.getState().active.get(2)).toBeDefined();
    takeOne().subscribe(state => {
      expect(state.active.length).toBe(2);
      expect(state.active.has(1)).toBeTrue();
      expect(state.active.get(1)).toBeDefined();
      expect(state.active.has(2)).toBeTrue();
      expect(state.active.get(2)).toBeDefined();
    });
  });

  it('should update the active', () => {
    store.setActive(1);
    store.update(1, { name: '1' });
    expect(store.getState().active.get(1).name).toBe('1');
    takeOne().subscribe(state => {
      expect(state.active.get(1).name).toBe('1');
    });
  });

  it('should add active (id)', () => {
    store.addActive(1);
    expect(store.getState().active.length).toBe(1);
    expect(store.getState().active.has(1)).toBeTrue();
    expect(store.getState().active.get(1)).toBeDefined();
    takeOne().subscribe(state => {
      expect(state.active.length).toBe(1);
      expect(state.active.has(1)).toBeTrue();
      expect(state.active.get(1)).toBeDefined();
    });
  });

  it('should add active (entity)', () => {
    store.addActive(simpleInitialState);
    expect(store.getState().active.length).toBe(1);
    expect(store.getState().active.has(1)).toBeTrue();
    expect(store.getState().active.get(1)).toBeDefined();
    takeOne().subscribe(state => {
      expect(state.active.length).toBe(1);
      expect(state.active.has(1)).toBeTrue();
      expect(state.active.get(1)).toBeDefined();
    });
  });

  it('should add active (many id)', () => {
    const newItens = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItens);
    store.addActive([1, 2]);
    expect(store.getState().active.length).toBe(2);
    expect(store.getState().active.has(1)).toBeTrue();
    expect(store.getState().active.get(1)).toBeDefined();
    expect(store.getState().active.has(2)).toBeTrue();
    expect(store.getState().active.get(2)).toBeDefined();
    takeOne().subscribe(state => {
      expect(state.active.length).toBe(2);
      expect(state.active.has(1)).toBeTrue();
      expect(state.active.get(1)).toBeDefined();
      expect(state.active.has(2)).toBeTrue();
      expect(state.active.get(2)).toBeDefined();
    });
  });

  it('should add active (many entity)', () => {
    const newItens = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItens);
    store.addActive([simpleInitialState, newItens[0]]);
    expect(store.getState().active.length).toBe(2);
    expect(store.getState().active.has(1)).toBeTrue();
    expect(store.getState().active.get(1)).toBeDefined();
    expect(store.getState().active.has(2)).toBeTrue();
    expect(store.getState().active.get(2)).toBeDefined();
    takeOne().subscribe(state => {
      expect(state.active.length).toBe(2);
      expect(state.active.has(1)).toBeTrue();
      expect(state.active.get(1)).toBeDefined();
      expect(state.active.has(2)).toBeTrue();
      expect(state.active.get(2)).toBeDefined();
    });
  });

  it('should remove active (removeActive)', () => {
    const newItens = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItens);
    store.addActive(1);
    expect(store.getState().active.has(1)).toBeTrue();
    takeOne().subscribe(state => {
      expect(state.active.has(1)).toBeTrue();
    });
    store.removeActive(1);
    expect(store.getState().active.has(1)).toBeFalse();
    takeOne().subscribe(state => {
      expect(state.active.has(1)).toBeFalse();
    });
    store.addActive([1, 2, 3]);
    expect(store.getState().active.length).toBe(3);
    store.removeActive([1, 2]);
    expect(store.getState().active.length).toBe(1);
  });

  it('should remove active (remove)', () => {
    const newItens = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItens);
    store.addActive([1, 2]);
    expect(store.getState().active.length).toBe(2);
    store.remove(1);
    expect(store.getState().active.length).toBe(1);
    expect(store.getState().active.has(1)).toBeFalse();
    expect(store.getState().active.has(2)).toBeTrue();
  });

  it('should toggle the active', () => {
    const newItens = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItens);
    store.toggleActive(1);
    expect(store.getState().active.has(1)).toBeTrue();
    store.toggleActive(1);
    expect(store.getState().active.has(1)).toBeFalse();
  });

  it('should remove the entities (removeActiveEntities)', () => {
    const newItens = [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
    store.add(newItens);
    store.addActive(1);
    expect(store.getState().active.has(1)).toBeTrue();
    expect(store.getState().entities.has(1)).toBeTrue();
    store.removeActiveEntities();
    expect(store.getState().entities.has(1)).toBeFalse();
    expect(store.getState().active.has(1)).toBeFalse();
    expect(store.getState().entities.length).toBe(2);
  });

  it('shoud replace', () => {
    store.update(1, { other: '1' });
    expect(store.getState().entities.get(1)).toEqual({ id: 1, name: 'Guilherme', other: '1' });
    store.replace(1, { id: 1, name: '1' });
    expect(store.getState().entities.get(1)).toEqual({ id: 1, name: '1' });
    expect(store.getState().entities.get(1).other).toBeUndefined();
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
    expect(store.getState().active.has(1)).toBeTrue();
    store.reset();
    expect(store.getState().entities.values).toEqual(entityInitialState);
    expect(store.getState().active.has(1)).toBeFalse();
  });

  it('should pass through preAdd', () => {
    spyOn(store, 'preAdd').and.callThrough();
    store.add({ id: 2, name: '2' });
    store.upsert(3, { id: 3, name: '3' });
    expect(store.preAdd).toHaveBeenCalledTimes(2);
    store.add([
      { id: 4, name: '4' },
      { id: 5, name: '5' },
    ]);
    store.upsert([
      { id: 4, name: '4two' },
      { id: 6, name: '6' },
    ]);
    expect(store.preAdd).toHaveBeenCalledTimes(5);
  });

  it('should pass through preUpdate', () => {
    spyOn(store, 'preUpdate').and.callThrough();
    store.update(1, { name: '1' });
    store.upsert([
      {
        id: 1,
        name: '2',
      },
      { id: 2, name: '2' },
    ]);
    expect(store.preUpdate).toHaveBeenCalledTimes(2);
    store.upsert([
      { id: 1, name: '1' },
      { id: 2, name: '32' },
    ]);
    expect(store.preUpdate).toHaveBeenCalledTimes(4);
  });

  it('should have cache', done => {
    store.setHasCache(true);
    expect(store.hasCache()).toBeTrue();
    setTimeout(() => {
      expect(store.hasCache()).toBeFalse();
      done();
    }, 1001);
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
    expect(store.getState().entities.get(1).name).toBe('1');
    expect(store.getState().entities.get(2).name).toBe('5');
    expect(store.getState().entities.get(3).name).toBe('5');
  });
});
