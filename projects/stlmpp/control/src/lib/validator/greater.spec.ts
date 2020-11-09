import { GreaterValidator } from './greater';
import { createFakeControl } from '../util-tests';

describe('greater validator', () => {
  let valNumber: GreaterValidator<number>;
  let valDate: GreaterValidator<Date>;

  beforeEach(() => {
    valNumber = new GreaterValidator<number>(5);
    valDate = new GreaterValidator<Date>(new Date(2020, 1, 14));
  });

  it('should not validated if value is falsey', () => {
    expect(valNumber.validate(createFakeControl(null as any))).toBeNull();
  });

  describe('number', () => {
    it('should return null if number is greater', () => {
      expect(valNumber.validate(createFakeControl(6))).toBeNull();
    });

    it('should return error if number is not greater', () => {
      expect(valNumber.validate(createFakeControl(5))).toEqual({ expectedGreaterThan: 5, actual: 5 });
    });
  });

  describe('date', () => {
    it('should return null if date is greater', () => {
      expect(valDate.validate(createFakeControl(new Date()))).toBeNull();
    });

    it('should return error if date is not greater', () => {
      expect(valDate.validate(createFakeControl(new Date(2020, 1, 13)))).toEqual({
        expectedGreaterThan: new Date(2020, 1, 14),
        actual: new Date(2020, 1, 13),
      });
    });
  });
});
