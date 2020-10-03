import { IdName } from '../util-test';
import { removeArray } from './remove-array';

describe('Remove Array', () => {
  let array: IdName[];

  beforeEach(() => {
    array = [
      { id: 1, name: '1' },
      { id: 2, name: '2' },
      { id: 3, name: '3' },
      { id: 4, name: '4' },
    ];
  });

  it('should remove one', () => {
    const newArray = removeArray(array, 1);
    expect(newArray.length).toBe(3);
    expect(newArray[0].id).toBe(2);
    expect(array.length).toBe(4);
    expect(array[0].id).toBe(1);
  });

  it('should remove many (ids)', () => {
    const newArray = removeArray(array, [1, 2]);
    expect(newArray.length).toBe(2);
    expect(newArray[0].id).toBe(3);
    expect(array.length).toBe(4);
    expect(array[0].id).toBe(1);
  });

  it('should remove many (callback)', () => {
    const newArray = removeArray(array, entity => entity.id === 1 || entity.name === '2');
    expect(newArray.length).toBe(2);
    expect(newArray[0].id).toBe(3);
    expect(array.length).toBe(4);
    expect(array[0].id).toBe(1);
  });

  it('should return empty', () => {
    const newArray = removeArray(undefined as any, 1);
    expect(newArray).toEqual([]);
  });
});
