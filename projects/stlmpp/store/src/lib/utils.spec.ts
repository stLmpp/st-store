import { deepFreeze, devCopy, distinctUntilManyChanged, predictIdType } from './utils';
import { IdGetter, idGetterFactory } from '@stlmpp/utils';
import { BehaviorSubject } from 'rxjs';
import { environment } from './environment';

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
      const idGetterString: IdGetter<any, string> = idGetterFactory('id');
      const convertToIdString = predictIdType({ 'id-123': { id: 'id-123' } }, idGetterString);
      expect(convertToIdString('id-123')).toBe('id-123');
      const idGetterNumber: IdGetter<any> = idGetterFactory('id');
      const convertToIdNumber = predictIdType({ 1: { id: 1 } }, idGetterNumber);
      expect(convertToIdNumber('1')).toBe(1);
      const convertToIdUndefined = predictIdType({}, idGetterNumber);
      expect(convertToIdUndefined('1')).toBe('1' as any);
    });
  });

  describe('distinctUntilManyChanged', () => {
    let state: BehaviorSubject<number[]>;

    beforeEach(() => {
      state = new BehaviorSubject([1, 2, 3]);
    });

    it('should distinct', () => {
      const subscriber = jasmine.createSpy('subscriber');
      state.pipe(distinctUntilManyChanged()).subscribe(subscriber);
      expect(subscriber).toHaveBeenCalledTimes(1);
      state.next([1, 2, 3]);
      expect(subscriber).toHaveBeenCalledTimes(1);
      const sub2 = jasmine.createSpy('sub2');
      const array = [1, 2, 3];
      state.next(array);
      state.pipe(distinctUntilManyChanged()).subscribe(sub2);
      expect(sub2).toHaveBeenCalledTimes(1);
      state.next(array);
      expect(sub2).toHaveBeenCalledTimes(1);
    });

    it('should not distinct', () => {
      const sub = jasmine.createSpy('sub');
      state.pipe(distinctUntilManyChanged()).subscribe(sub);
      expect(sub).toHaveBeenCalledTimes(1);
      state.next([1, 2]);
      expect(sub).toHaveBeenCalledTimes(2);
      state.next([1, 2, 3]);
      expect(sub).toHaveBeenCalledTimes(3);
      state.next([3, 2, 1]);
      expect(sub).toHaveBeenCalledTimes(4);
      state.next(undefined as any);
      expect(sub).toHaveBeenCalledTimes(5);
      state.next([1, 2, 3]);
      expect(sub).toHaveBeenCalledTimes(6);
    });
  });

  describe('devCopy', () => {
    beforeEach(() => {
      environment.reset();
    });

    it('should not dev copy', () => {
      environment.isDev = false;
      const obj = { a: 1 };
      const objCopy = devCopy(obj);
      objCopy.a = 2;
      expect(obj.a).toBe(2);
    });

    it('should dev copy but not copy', () => {
      environment.copyData = false;
      const obj = { a: 2 };
      devCopy(obj);
      expect(() => (obj.a = 3)).toThrow();
    });

    it('should dev copy but not freeze', () => {
      environment.freezeData = false;
      const obj = { a: 1 };
      const objCopy = devCopy(obj);
      objCopy.a = 2;
      expect(obj.a).toBe(1);
    });
  });
});
