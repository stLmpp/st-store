import { IdName } from '../util-test';
import { upsertArray } from './upsert-array';

describe('Upsert array', () => {
  let array: IdName[];

  beforeEach(() => {
    array = [
      { id: 1, name: '1' },
      { id: 2, name: '2' },
      { id: 3, name: '3' },
      { id: 4, name: '4' },
    ];
  });

  it('should upsert one', () => {
    const newArray = upsertArray(array, { id: 1, other: '1' });
    expect(newArray.length).toBe(4);
    expect(newArray[0].other).toBe('1');
    expect(array.length).toBe(4);
    expect(array[0].other).toBeUndefined();
    const newArray2 = upsertArray(newArray, { id: 5, name: '5' });
    expect(newArray2.length).toBe(5);
    expect(newArray2[4]).toEqual({ id: 5, name: '5' });
    expect(newArray.length).toBe(4);
    expect(newArray[4]).toBeUndefined();
  });

  it('should upsert many', () => {
    const newArray = upsertArray(array, [
      { id: 1, other: '1' },
      { id: 5, name: '5' },
    ]);
    expect(newArray.length).toBe(5);
    expect(newArray[0].other).toBe('1');
    expect(newArray[4]).toEqual({ id: 5, name: '5' });
    expect(array.length).toBe(4);
    expect(array[0].other).toBeUndefined();
    expect(array[4]).toBeUndefined();
  });

  it('should upsert empty and undefined', () => {
    expect(upsertArray(undefined as any, { id: 1, name: '1' })).toEqual([{ id: 1, name: '1' }]);
    expect(upsertArray([{ id: 1, name: '1' }], undefined as any)).toEqual([{ id: 1, name: '1' }]);
    expect(upsertArray([], { id: 1, name: '1' })).toEqual([{ id: 1, name: '1' }]);
    expect(upsertArray([{ id: 1, name: '1' }], { name: '1' })).toEqual([{ id: 1, name: '1' }]);
    expect(upsertArray([{ id: 1, name: '1' }], [])).toEqual([{ id: 1, name: '1' }]);
  });
});
