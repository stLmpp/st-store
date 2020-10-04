import { StMap } from './map';
import { IdName } from './util-test';

describe('StMap', () => {
  const data: IdName[] = [
    { id: 1, name: 'Guilherme' },
    { id: 2, name: 'Teste' },
  ];
  const idGetter = (entity: IdName) => entity.id;
  let map: StMap<IdName>;

  beforeEach(() => {
    map = new StMap<IdName>(idGetter).fromArray(data);
  });

  it('should set from array', () => {
    map.fromArray([]);
    expect(map.length).toBe(0);
    expect(map.has(1)).toBeFalse();
    expect(map.get(1)).toBeUndefined();
    map.fromArray(data);
    expect(map).toBeDefined();
    expect(map.length).toBe(2);
    expect(map.state).toBeDefined();
    expect(map.state).toEqual({ 1: { id: 1, name: 'Guilherme' }, 2: { id: 2, name: 'Teste' } });
    expect(map.keys).toBeDefined();
    expect(map.keys).toEqual(new Set([1, 2]));
    map.fromArray(undefined as any);
    expect(map.length).toBe(0);
    expect(map.has(1)).toBeFalse();
    expect(map.get(1)).toBeUndefined();
  });

  it('should create the map', () => {
    expect(map).toBeDefined();
    expect(map.length).toBe(2);
    expect(map.state).toBeDefined();
    expect(map.state).toEqual({ 1: { id: 1, name: 'Guilherme' }, 2: { id: 2, name: 'Teste' } });
    expect(map.keys).toBeDefined();
    expect(map.keys).toEqual(new Set([1, 2]));
  });

  it('should get state copy', () => {
    const state = map.state;
    expect(state).toBeDefined();
    expect(state).toEqual({ 1: { id: 1, name: 'Guilherme' }, 2: { id: 2, name: 'Teste' } });
  });

  it('should get the length', () => {
    const length = map.length;
    expect(length).toBeDefined();
    expect(length).toBe(2);
  });

  it('should get the keys (Set)', () => {
    const keys = map.keys;
    const set = new Set([1, 2]);
    expect(keys).toBeDefined();
    expect(keys).toEqual(set);
    expect(keys.size).toBe(2);
  });

  it('should get the keys (Array)', () => {
    const keys = map.keysArray;
    const keysArray = [1, 2];
    expect(keys).toBeDefined();
    expect(keys).toEqual(keysArray);
    expect(keys.length).toBe(2);
  });

  it('should get the entries', () => {
    const entries = map.entries;
    const shouldBe: [number, { id: number; name: string }][] = [
      [1, { id: 1, name: 'Guilherme' }],
      [2, { id: 2, name: 'Teste' }],
    ];
    expect(entries).toBeDefined();
    expect(entries).toEqual(shouldBe);
  });

  it('should get the values', () => {
    const values = map.values;
    expect(values).toBeDefined();
    expect(values).toEqual(data);
  });

  it('should filter', () => {
    const filtered = map.filter((_, key) => key === 1);
    expect(filtered.length).toBe(1);
    expect(filtered.has(2)).toBeFalse();
    expect(filtered.has(1)).toBeTrue();
    expect(filtered.get(1)).toEqual({ id: 1, name: 'Guilherme' });
  });

  it('should map', () => {
    const mapped = map.map((entity, key) => ({ ...entity, name: '' + key }));
    expect(mapped.length).toBe(2);
    expect(mapped.has(1)).toBeTrue();
    expect(mapped.has(2)).toBeTrue();
    expect(mapped.get(1)).toEqual({ id: 1, name: '1' });
    expect(mapped.get(2)).toEqual({ id: 2, name: '2' });
  });

  it('should find', () => {
    const found = map.find((_, key) => key === 1);
    expect(found).toBeDefined();
    expect(found).toEqual({ id: 1, name: 'Guilherme' });
    const notFound = map.find(entity => entity.name === 'Guilherme 2');
    expect(notFound).toBeUndefined();
  });

  it('should forEach', () => {
    let countLoop = 0;
    map.forEach((entity, key) => {
      countLoop++;
      expect(entity).toBeDefined();
      expect(key).toBeDefined();
    });
    expect(countLoop).toBe(2);
  });

  it('should some', () => {
    const exists = map.some(entity => entity.name === 'Guilherme');
    expect(exists).toBeTrue();
    const notExists = map.some(entity => entity.name === 'Guilherme 2');
    expect(notExists).toBeFalse();
  });

  it('should every', () => {
    const notEvery = map.every(entity => entity.name === 'Guilherme');
    expect(notEvery).toBeFalse();
    const every = map.every(entity => !!entity);
    expect(every).toBeTrue();
  });

  it('should reduce', () => {
    const reduced1 = map.reduce((acc, [key, value]) => {
      return {
        ...acc,
        [key]: value,
      };
    }, {});
    const reduced2 = map.reduce((acc, [key, value]) => {
      return acc + value.id;
    }, 0);
    const reduced3 = map.reduce((acc, [key]) => {
      return [...acc, key];
    }, [] as number[]);
    expect(reduced1).toBeDefined();
    expect(reduced1).toEqual({ 1: { id: 1, name: 'Guilherme' }, 2: { id: 2, name: 'Teste' } });
    expect(reduced2).toBeDefined();
    expect(reduced2).toBe(3);
    expect(reduced3).toBeDefined();
    expect(reduced3).toEqual([1, 2]);
  });

  it('should pop', () => {
    let popped = map.pop();
    expect(map.length).toBe(1);
    expect(map.has(1)).toBeTrue();
    expect(map.has(2)).toBeFalse();
    expect(popped).toBeDefined();
    expect(popped).toEqual({ id: 2, name: 'Teste' });
    map.fromObject({});
    popped = map.pop();
    expect(popped).toBeUndefined();
  });

  it('should shift', () => {
    let shifted = map.shift();
    expect(map.length).toBe(1);
    expect(map.has(2)).toBeTrue();
    expect(map.has(1)).toBeFalse();
    expect(shifted).toBeDefined();
    expect(shifted).toEqual({ id: 1, name: 'Guilherme' });
    shifted = map.fromObject({}).shift();
    expect(shifted).toBeUndefined();
  });

  it('should set', () => {
    map.set(3, { id: 3, name: '3' });
    expect(map.has(3)).toBeTrue();
    expect(map.get(3)).toBeDefined();
    expect(map.length).toBe(3);
  });

  it('should set many (Array)', () => {
    map.setMany([{ id: 3, name: '3' }]);
    expect(map.length).toBe(3);
    expect(map.has(3)).toBeTrue();
    expect(map.get(3)).toEqual({ id: 3, name: '3' });
    map.setMany([]);
    expect(map.length).toBe(3);
    expect(map.has(3)).toBeTrue();
    expect(map.get(3)).toEqual({ id: 3, name: '3' });
    map.setMany(undefined as any);
    expect(map.length).toBe(3);
    expect(map.has(3)).toBeTrue();
    expect(map.get(3)).toEqual({ id: 3, name: '3' });
  });

  it('should set many (Object)', () => {
    map.setMany({ 3: { id: 3, name: '3' } });
    expect(map.length).toBe(3);
    expect(map.has(3)).toBeTrue();
    expect(map.get(3)).toEqual({ id: 3, name: '3' });
    map.setMany({});
    expect(map.length).toBe(3);
    expect(map.has(3)).toBeTrue();
    expect(map.get(3)).toEqual({ id: 3, name: '3' });
  });

  it('should set many (StMap)', () => {
    map.setMany(new StMap<IdName>(idGetter).set(3, { id: 3, name: '3' }));
    expect(map.length).toBe(3);
    expect(map.has(3)).toBeTrue();
    expect(map.get(3)).toEqual({ id: 3, name: '3' });
    map.setMany(new StMap<IdName>(idGetter));
    expect(map.length).toBe(3);
    expect(map.has(3)).toBeTrue();
    expect(map.get(3)).toEqual({ id: 3, name: '3' });
  });

  it('should set from entity', () => {
    map.fromEntity({ id: 3, name: '3' });
    expect(map.length).toBe(3);
    expect(map.has(3)).toBeTrue();
    expect(map.get(3)).toEqual({ id: 3, name: '3' });
  });

  it('should set from object', () => {
    map.fromObject({ 1: { id: 1, name: '1' } });
    expect(map.length).toBe(1);
    expect(map.has(1)).toBeTrue();
    expect(map.get(1)).toEqual({ id: 1, name: '1' });
    map.fromObject({});
    expect(map.length).toBe(0);
    expect(map.has(1)).toBeFalse();
    expect(map.get(1)).toBeUndefined();
    map.fromObject({ 2: { id: 2, name: '2' } }, true);
    expect(map.length).toBe(1);
    expect(map.has(2)).toBeTrue();
    expect(map.get(2)).toEqual({ id: 2, name: '2' });
  });

  it('should set from tuple', () => {
    map.fromTuple([[1, { id: 1, name: '1' }]]);
    expect(map.length).toBe(1);
    expect(map.has(1)).toBeTrue();
    expect(map.get(1)).toEqual({ id: 1, name: '1' });
    map.fromTuple([]);
    expect(map.length).toBe(0);
    expect(map.has(1)).toBeFalse();
    expect(map.get(1)).toBeUndefined();
    map.fromTuple(undefined as any);
    expect(map.length).toBe(0);
    expect(map.has(1)).toBeFalse();
    expect(map.get(1)).toBeUndefined();
  });

  it('should merge (Array)', () => {
    map.merge([
      { id: 1, name: '1' },
      { id: 3, name: '3' },
    ]);
    expect(map.length).toBe(2);
    expect(map.has(3)).toBeFalse();
    expect(map.get(1)).toEqual({ id: 1, name: '1' });
    map.merge(
      [
        { id: 1, name: 'Guilherme' },
        { id: 3, name: '3' },
      ],
      { upsert: true }
    );
    expect(map.length).toBe(3);
    expect(map.has(3)).toBeTrue();
    expect(map.get(1)).toEqual({ id: 1, name: 'Guilherme' });
    expect(map.get(3)).toEqual({ id: 3, name: '3' });
  });

  it('should merge (Object)', () => {
    map.merge({
      1: { id: 1, name: '1' },
      3: { id: 3, name: '3' },
    });
    expect(map.length).toBe(2);
    expect(map.has(3)).toBeFalse();
    expect(map.get(1)).toEqual({ id: 1, name: '1' });
    map.merge(
      {
        1: { id: 1, name: 'Guilherme' },
        3: { id: 3, name: '3' },
      },
      { upsert: true }
    );
    expect(map.length).toBe(3);
    expect(map.has(3)).toBeTrue();
    expect(map.get(1)).toEqual({ id: 1, name: 'Guilherme' });
    expect(map.get(3)).toEqual({ id: 3, name: '3' });
  });

  it('should merge (StMap)', () => {
    map.merge(new StMap<IdName>(idGetter).set(1, { id: 1, name: '1' }).set(3, { id: 3, name: '3' }));
    expect(map.length).toBe(2);
    expect(map.has(3)).toBeFalse();
    expect(map.get(1)).toEqual({ id: 1, name: '1' });
    map.merge(new StMap<IdName>(idGetter).set(1, { id: 1, name: 'Guilherme' }).set(3, { id: 3, name: '3' }), {
      upsert: true,
    });
    expect(map.length).toBe(3);
    expect(map.has(3)).toBeTrue();
    expect(map.get(1)).toEqual({ id: 1, name: 'Guilherme' });
    expect(map.get(3)).toEqual({ id: 3, name: '3' });
  });

  it('should not merge', () => {
    map.merge(undefined as any);
    expect(map.length).toBe(2);
    map.merge([]);
    expect(map.length).toBe(2);
    map.merge({});
    expect(map.length).toBe(2);
    map.merge(new StMap(idGetter));
    expect(map.length).toBe(2);
  });

  it('should update', () => {
    map.update(1, { name: '1' });
    expect(map.get(1)?.name).toBe('1');
    map.update(1, entity => ({ ...entity, name: 'Guilherme' }));
    expect(map.get(1)?.name).toBe('Guilherme');
    map.update(888434, { name: '3' });
    expect(map.get(888434)).toBeUndefined();
    expect(map.has(888434)).toBeFalse();
    expect(map.length).toBe(2);
  });

  it('should upsert', () => {
    map.upsert(1, { name: '1' });
    expect(map.length).toBe(2);
    expect(map.get(1)?.name).toBe('1');
    map.upsert(3, { id: 1, name: '3' });
    expect(map.length).toBe(3);
    expect(map.has(3)).toBeTrue();
    expect(map.get(3)).toEqual({ id: 1, name: '3' });
    map.upsert([
      { id: 3, name: 'Teste3' },
      { id: 4, name: '4' },
    ]);
    expect(map.length).toBe(4);
    expect(map.has(4)).toBeTrue();
    expect(map.get(4)).toEqual({ id: 4, name: '4' });
    expect(map.get(3)?.name).toBe('Teste3');
  });

  it('should remove (id)', () => {
    map.remove(1);
    expect(map.get(1)).toBeUndefined();
    expect(map.has(1)).toBeFalse();
    expect(map.length).toBe(1);
  });

  it('should remove (ids)', () => {
    map.remove([1, 2]);
    expect(map.get(1)).toBeUndefined();
    expect(map.has(1)).toBeFalse();
    expect(map.length).toBe(0);
  });

  it('should remove (callback)', () => {
    map.remove(entity => entity.name === 'Teste');
    expect(map.get(2)).toBeUndefined();
    expect(map.has(2)).toBeFalse();
    expect(map.length).toBe(1);
  });

  it('should throw error if idGetter not set', () => {
    expect(() => {
      const newMap = new StMap<any, any>(undefined as any);
    }).toThrow();
  });
});
