import { getDeep, GetDeepPipe } from './get-deep';
import { TestBed } from '@angular/core/testing';

describe('GetDeep Pipe', () => {
  let getDeepPipe: GetDeepPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [GetDeepPipe] });
    getDeepPipe = TestBed.inject(GetDeepPipe);
  });

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

  it('should return default value', () => {
    expect(getDeep(obj, ['asd'], 1)).toBe(1);
    expect(getDeep(undefined, ['nested', '123'])).toBeUndefined();
  });

  it('should create pipe', () => {
    expect(getDeepPipe).toBeDefined();
  });

  it('should use pipe', () => {
    expect(getDeepPipe.transform(obj, 'name')).toBe('Guilherme');
  });
});
