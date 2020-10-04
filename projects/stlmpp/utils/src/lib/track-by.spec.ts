import { trackByConcat, trackByFactory } from './track-by';
import { IdName } from './util-test';

describe('track by', () => {
  let obj: IdName;

  beforeEach(() => {
    obj = { id: 1, name: '1', other: '1' };
  });

  describe('factory', () => {
    it('should return the id', () => {
      const trackBy = trackByFactory<IdName>('id', 'name', 'other');
      expect(trackBy(1, obj)).toBe(1);
    });

    it('should return the fallback', () => {
      const trackBy = trackByFactory<IdName>('id', 'name', 'other');
      expect(trackBy(1, { id: 0, name: '1', other: '2' })).toBe('1');
      expect(trackBy(1, { id: 0, name: '', other: '2' })).toBe('2');
    });

    it('should return the index', () => {
      expect(trackByFactory()(1, {})).toBe(1);
      expect(trackByFactory()(1, undefined)).toBe(1);
      expect(trackByFactory('id', 'name', 'other')(1, { id: 0, name: '', other: '' })).toBe(1);
    });
  });

  describe('concat', () => {
    it('should return id + name', () => {
      const trackBy = trackByConcat<IdName>(['id', 'name']);
      expect(trackBy(1, obj)).toBe('1-1');
    });

    it('should return id + name, but not other', () => {
      const trackBy = trackByConcat<IdName>(['id', 'name', 'other']);
      expect(trackBy(1, { id: 1, name: '1', other: '' })).toBe('1-1');
    });

    it('should return index', () => {
      const trackBy = trackByConcat<IdName>(['id', 'name', 'other']);
      expect(trackBy(1, { id: 0, name: '' })).toBe(1);
      expect(trackBy(1, undefined as any)).toBe(1);
    });
  });
});
