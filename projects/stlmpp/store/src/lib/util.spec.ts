import { deepFreeze, devCopy, predictIdType } from './util';
import { IdGetter, parseIdGetter } from 'st-utils';

describe('Utils', () => {
  describe('deepFreeze', () => {
    it('should deep freeze object', () => {
      const obj = deepFreeze({ a: { b: { c: 1 } } });
      expect(() => (obj.a = { b: { c: 2 } })).toThrow();
      expect(() => (obj.a.b = { c: 2 })).toThrow();
      expect(() => (obj.a.b.c = 2)).toThrow();
    });

    it('should deep freeze array', () => {
      const array = deepFreeze([{ a: { b: { c: 1, d: [{ e: 1 }] } } }]);
      expect(() => (array[0] = { a: { b: { c: 2, d: [{ e: 2 }] } } })).toThrow();
      expect(() => (array[0].a = { b: { c: 2, d: [{ e: 2 }] } })).toThrow();
      expect(() => (array[0].a.b = { c: 2, d: [{ e: 2 }] })).toThrow();
      expect(() => (array[0].a.b.c = 2)).toThrow();
      expect(() => (array[0].a.b.d = [{ e: 2 }]));
      expect(() => (array[0].a.b.d[0] = { e: 2 }));
      expect(() => (array[0].a.b.d[0].e = 2)).toThrow();
    });

    it('should not deep freeze', () => {
      let obj = Object.freeze({ a: 1 });
      obj = deepFreeze(obj);
      expect(() => ((obj as any).a = 2)).toThrow();
      const und = deepFreeze(undefined);
      expect(und).toBeUndefined();
    });
  });

  describe('predictIdType', () => {
    it('should predict id type', () => {
      const idGetterString: IdGetter<any, string> = parseIdGetter('id');
      const convertToIdString = predictIdType({ 'id-123': { id: 'id-123' } }, idGetterString);
      expect(convertToIdString('id-123')).toBe('id-123');
      const idGetterNumber: IdGetter<any, any> = parseIdGetter('id');
      const convertToIdNumber = predictIdType({ 1: { id: 1 } }, idGetterNumber);
      expect(convertToIdNumber('1')).toBe(1);
      const convertToIdUndefined = predictIdType({}, idGetterNumber);
      expect(convertToIdUndefined('1')).toBe('1' as any);
    });
  });

  describe('devCopy', () => {
    it('should freeze', () => {
      let obj = { a: 2 };
      obj = devCopy(obj);
      expect(() => (obj.a = 3)).toThrow();
    });
  });
});
