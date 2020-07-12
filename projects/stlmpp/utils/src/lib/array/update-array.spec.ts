import { IdName } from '../util-test';
import { updateArray } from './update-array';

describe('Update Array', () => {
  let array: IdName[];

  beforeEach(() => {
    array = [
      { id: 1, name: '1' },
      { id: 2, name: '2' },
      { id: 3, name: '3' },
      { id: 4, name: '4' },
    ];
  });

  it('should update (id) with partial', () => {
    const newArray = updateArray(array, 1, { name: 'Teste' });
    expect(newArray[0].name).toBe('Teste');
    expect(newArray.length).toBe(4);
    expect(array[0].name).toBe('1');
    expect(array.length).toBe(4);
  });

  it('should update (ids) with partial', () => {
    const newArray = updateArray(array, [1, 2], { name: 'Teste' });
    expect(newArray[0].name).toBe('Teste');
    expect(newArray[1].name).toBe('Teste');
    expect(newArray.length).toBe(4);
    expect(array[0].name).toBe('1');
    expect(array[1].name).toBe('2');
    expect(array.length).toBe(4);
  });

  it('should update (callback) with partial', () => {
    const newArray = updateArray(array, entity => entity.id === 1, { name: 'Teste' });
    expect(newArray[0].name).toBe('Teste');
    expect(newArray.length).toBe(4);
    expect(array[0].name).toBe('1');
    expect(array.length).toBe(4);
  });

  it('should update (id) with callback', () => {
    const newArray = updateArray(array, 1, entity => ({ ...entity, name: 'Teste' }));
    expect(newArray[0].name).toBe('Teste');
    expect(newArray.length).toBe(4);
    expect(array[0].name).toBe('1');
    expect(array.length).toBe(4);
  });

  it('should update (ids) with callback', () => {
    const newArray = updateArray(array, [1, 2], entity => ({ ...entity, name: 'Teste' }));
    expect(newArray[0].name).toBe('Teste');
    expect(newArray[1].name).toBe('Teste');
    expect(newArray.length).toBe(4);
    expect(array[0].name).toBe('1');
    expect(array[1].name).toBe('2');
    expect(array.length).toBe(4);
  });

  it('should update (callback) with callback', () => {
    const newArray = updateArray(
      array,
      entity => entity.id === 1,
      entity => ({ ...entity, name: 'Teste' })
    );
    expect(newArray[0].name).toBe('Teste');
    expect(newArray.length).toBe(4);
    expect(array[0].name).toBe('1');
    expect(array.length).toBe(4);
  });
});
