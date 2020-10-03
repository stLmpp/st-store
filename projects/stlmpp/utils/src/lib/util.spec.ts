import { idGetterFactory, isID } from './util';

describe('Util', () => {
  it('should return if it is ID', () => {
    expect(isID(1)).toBeTrue();
    expect(isID('2')).toBeTrue();
    expect(isID(new Date())).toBeFalse();
    expect(isID({})).toBeFalse();
    expect(isID([])).toBeFalse();
    expect(isID(() => {})).toBeFalse();
    expect(isID(class {})).toBeFalse();
  });

  it('should return an idGetter function', () => {
    const idGetter1 = idGetterFactory();
    expect(idGetter1({ id: 1 })).toBe(1);
    const idGetter2 = idGetterFactory<any, string>('name');
    expect(idGetter2({ name: '2' })).toBe('2');
    const idGetter3 = idGetterFactory<any, number>((entity: any) => entity.idNew);
    expect(idGetter3({ idNew: 2 })).toBe(2);
    const idGetter4 = idGetterFactory<any, number>('nested.id');
    expect(idGetter4({ nested: { id: 1 } })).toBe(1);
    const idGetter5 = idGetterFactory<any, number>(['nested', 'id']);
    expect(idGetter5({ nested: { id: 1 } })).toBe(1);
    const idGetter6 = idGetterFactory({} as any);
    expect(idGetter6({ id: 1 })).toBe(1);
  });
});
