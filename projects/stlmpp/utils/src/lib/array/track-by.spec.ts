import { trackByFactory } from './track-by';
import { IdName } from '../util-test';

describe('track by', () => {
  let obj: IdName;

  beforeEach(() => {
    obj = { id: 1, name: '1', other: '1' };
  });

  describe('factory', () => {
    it('should return the id', () => {
      const trackBy = trackByFactory<IdName>('id');
      expect(trackBy(1, obj)).toBe(1);
    });

    it('should return the index', () => {
      const trackBy = trackByFactory<IdName>('id');
      expect(trackBy(1, undefined as any)).toBe(1);
      const trackBy1 = trackByFactory<IdName>();
      expect(trackBy1(2, obj)).toBe(2);
    });
  });
});
