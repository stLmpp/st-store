import { getDeep } from './get-deep';

describe('GetDeep Pipe', () => {
  const obj = {
    id: 1,
    name: 'Guilherme',
    nested: { id: 2, name: 'GuilhermeNested', nested2: { id: 3, name: 'GuilhermeNested2' } },
  };

  it('should return with string | keyof', () => {
    const value = getDeep(obj, 'name');
    expect(value).toBe('Guilherme');
    const value2 = getDeep(obj, 'name2');
    expect(value2).toBeUndefined();
    const value3 = getDeep(obj, 'nested.name');
    expect(value3).toBe('GuilhermeNested');
    const value4 = getDeep(obj, 'nested.name.teste');
    expect(value4).toBeUndefined();
  });

  it('should return with string[] | keyof[]', () => {
    const value = getDeep(obj, ['name']);
    expect(value).toBe('Guilherme');
    const value2 = getDeep(obj, ['name2']);
    expect(value2).toBeUndefined();
    const value3 = getDeep(obj, ['nested', 'name']);
    expect(value3).toBe('GuilhermeNested');
    const value4 = getDeep(obj, ['nested', 'name', 'teste']);
    expect(value4).toBeUndefined();
  });
});
