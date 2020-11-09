import { isEmptyValue } from './util';

describe('utils', () => {
  it('should check whether the control value is empty', () => {
    expect(isEmptyValue('')).toBeTrue();
    expect(isEmptyValue({})).toBeFalse();
    expect(isEmptyValue([])).toBeFalse();
    expect(isEmptyValue(null)).toBeTrue();
    expect(isEmptyValue(undefined)).toBeTrue();
  });
});
