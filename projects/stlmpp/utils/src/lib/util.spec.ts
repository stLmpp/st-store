import {
  coerceArray,
  coerceBooleanProperty,
  idGetterFactory,
  isArray,
  isDate,
  isFunction,
  isID,
  isNil,
  isNull,
  isNumber,
  isObject,
  isObjectEmpty,
  isRegExp,
  isString,
  isUndefined,
  uniq,
  uniqBy,
} from './util';

describe('Util', () => {
  const str = 'string';
  const nro = 1;
  const array: any[] = [];
  const fn = (): void => {};
  const obj = {};
  const undef = undefined;
  const nll = null;
  const date = new Date();
  const reg = new RegExp('');

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

  it('should return whether the value is a string', () => {
    expect(isString(str)).toBeTrue();
    expect(isString(nro)).toBeFalse();
    expect(isString(array)).toBeFalse();
    expect(isString(fn)).toBeFalse();
    expect(isString(obj)).toBeFalse();
    expect(isString(undef)).toBeFalse();
    expect(isString(nll)).toBeFalse();
    expect(isString(date)).toBeFalse();
    expect(isString(reg)).toBeFalse();
  });

  it('should return wheter the value is a number', () => {
    expect(isNumber(str)).toBeFalse();
    expect(isNumber(nro)).toBeTrue();
    expect(isNumber(array)).toBeFalse();
    expect(isNumber(fn)).toBeFalse();
    expect(isNumber(obj)).toBeFalse();
    expect(isNumber(undef)).toBeFalse();
    expect(isNumber(nll)).toBeFalse();
    expect(isNumber(date)).toBeFalse();
    expect(isNumber(reg)).toBeFalse();
  });
  it('should return wheter the value is a array', () => {
    expect(isArray(str)).toBeFalse();
    expect(isArray(nro)).toBeFalse();
    expect(isArray(array)).toBeTrue();
    expect(isArray(fn)).toBeFalse();
    expect(isArray(obj)).toBeFalse();
    expect(isArray(undef)).toBeFalse();
    expect(isArray(nll)).toBeFalse();
    expect(isArray(date)).toBeFalse();
    expect(isArray(reg)).toBeFalse();
  });
  it('should return wheter the value is a function', () => {
    expect(isFunction(str)).toBeFalse();
    expect(isFunction(nro)).toBeFalse();
    expect(isFunction(array)).toBeFalse();
    expect(isFunction(fn)).toBeTrue();
    expect(isFunction(obj)).toBeFalse();
    expect(isFunction(undef)).toBeFalse();
    expect(isFunction(nll)).toBeFalse();
    expect(isFunction(date)).toBeFalse();
    expect(isFunction(reg)).toBeFalse();
  });
  it('should return wheter the value is a object', () => {
    expect(isObject(str)).toBeFalse();
    expect(isObject(nro)).toBeFalse();
    expect(isObject(array)).toBeTrue();
    expect(isObject(fn)).toBeFalse();
    expect(isObject(obj)).toBeTrue();
    expect(isObject(undef)).toBeFalse();
    expect(isObject(nll)).toBeFalse();
    expect(isObject(date)).toBeTrue();
    expect(isObject(reg)).toBeTrue();
  });
  it('should return wheter the value is undefined', () => {
    expect(isUndefined(str)).toBeFalse();
    expect(isUndefined(nro)).toBeFalse();
    expect(isUndefined(array)).toBeFalse();
    expect(isUndefined(fn)).toBeFalse();
    expect(isUndefined(obj)).toBeFalse();
    expect(isUndefined(undef)).toBeTrue();
    expect(isUndefined(nll)).toBeFalse();
    expect(isUndefined(date)).toBeFalse();
    expect(isUndefined(reg)).toBeFalse();
  });
  it('should return wheter the value is null', () => {
    expect(isNull(str)).toBeFalse();
    expect(isNull(nro)).toBeFalse();
    expect(isNull(array)).toBeFalse();
    expect(isNull(fn)).toBeFalse();
    expect(isNull(obj)).toBeFalse();
    expect(isNull(undef)).toBeFalse();
    expect(isNull(nll)).toBeTrue();
    expect(isNull(date)).toBeFalse();
    expect(isNull(reg)).toBeFalse();
  });
  it('should return wheter the value is a date', () => {
    expect(isDate(str)).toBeFalse();
    expect(isDate(nro)).toBeFalse();
    expect(isDate(array)).toBeFalse();
    expect(isDate(fn)).toBeFalse();
    expect(isDate(obj)).toBeFalse();
    expect(isDate(undef)).toBeFalse();
    expect(isDate(nll)).toBeFalse();
    expect(isDate(date)).toBeTrue();
    expect(isDate(reg)).toBeFalse();
  });
  it('should return wheter the value is a regexp', () => {
    expect(isRegExp(str)).toBeFalse();
    expect(isRegExp(nro)).toBeFalse();
    expect(isRegExp(array)).toBeFalse();
    expect(isRegExp(fn)).toBeFalse();
    expect(isRegExp(obj)).toBeFalse();
    expect(isRegExp(undef)).toBeFalse();
    expect(isRegExp(nll)).toBeFalse();
    expect(isRegExp(date)).toBeFalse();
    expect(isRegExp(reg)).toBeTrue();
  });
  it('should return whether the value is null or undefined (nil)', () => {
    expect(isNil(str)).toBeFalse();
    expect(isNil(nro)).toBeFalse();
    expect(isNil(array)).toBeFalse();
    expect(isNil(fn)).toBeFalse();
    expect(isNil(obj)).toBeFalse();
    expect(isNil(undef)).toBeTrue();
    expect(isNil(nll)).toBeTrue();
    expect(isNil(date)).toBeFalse();
    expect(isNil(reg)).toBeFalse();
  });

  it('should check if object is empty', () => {
    expect(isObjectEmpty({})).toBeTrue();
    expect(isObjectEmpty({ a: 1 })).toBeFalse();
  });

  it('should return uniq values for array', () => {
    expect(uniq([1, 1, 2, 2, 3, 3, 4, 3, 2])).toEqual([1, 2, 3, 4]);
  });

  it('should return uniq values for array by key', () => {
    expect(
      uniqBy([{ id: 1 }, { id: 1 }, { id: 2 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }, { id: 4 }], 'id')
    ).toEqual([{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }, { id: 5 }]);
  });

  it('should coerce the array', () => {
    expect(coerceArray('')).toEqual(['']);
    expect(coerceArray([''])).toEqual(['']);
  });

  it('should coerce boolean property', () => {
    expect(coerceBooleanProperty(null)).toBeFalse();
    expect(coerceBooleanProperty(undefined)).toBeFalse();
    expect(coerceBooleanProperty('')).toBeTrue();
    expect(coerceBooleanProperty('false')).toBeFalse();
  });
});
