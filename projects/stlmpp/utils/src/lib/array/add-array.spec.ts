import { IdName } from '../util-test';
import { addArray } from './add-array';

describe('Add Array', () => {
  let array: IdName[];

  beforeEach(() => {
    array = [{ id: 1, name: '1' }];
  });

  it('should add array (one)', () => {
    const newArray = addArray(array, { id: 2, name: '2' });
    expect(newArray.length).toBe(2);
    expect(newArray[1]).toBeDefined();
    expect(newArray[1]).toEqual({ id: 2, name: '2' });
    expect(array.length).toBe(1);
  });

  it('should add array (many)', () => {
    const newArray = addArray(array, [
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ]);
    expect(newArray.length).toBe(3);
    expect(newArray[1]).toBeDefined();
    expect(newArray[1]).toEqual({ id: 2, name: '2' });
    expect(newArray[2]).toBeDefined();
    expect(newArray[2]).toEqual({ id: 3, name: '3' });
    expect(array.length).toBe(1);
  });
});
