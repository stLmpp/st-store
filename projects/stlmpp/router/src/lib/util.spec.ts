import { isEqualParams } from './util';

describe('util', () => {
  it('should return false is any of the two are null | undefined', () => {
    expect(isEqualParams(undefined as any, {})).toBeFalse();
    expect(isEqualParams({}, undefined as any)).toBeFalse();
    expect(isEqualParams(undefined as any, undefined as any)).toBeFalse();
  });
});
