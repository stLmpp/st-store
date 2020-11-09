import { BetweenValidator } from './between';
import { createFakeControl } from '../util-tests';

describe('between validator', () => {
  let valNumber: BetweenValidator<number>;
  let valDate: BetweenValidator<Date>;

  beforeEach(() => {
    valNumber = new BetweenValidator<number>(0, 10);
    valDate = new BetweenValidator<Date>(new Date(2020, 1, 14), new Date(2020, 1, 24));
  });

  it('should not validate if value is null or undefined', () => {
    expect(valNumber.validate(createFakeControl(null as any))).toBeNull();
    expect(valDate.validate(createFakeControl(null as any))).toBeNull();
  });

  describe('number', () => {
    it('should return error if value is not between', () => {
      expect(valNumber.validate(createFakeControl(11))).toEqual({ expectedStart: 0, expectedEnd: 10, actual: 11 });
    });

    it('should return null if value is between', () => {
      expect(valNumber.validate(createFakeControl(5))).toBeNull();
    });

    it('should include start and end by default', () => {
      expect(valNumber.validate(createFakeControl(0))).toBeNull();
      expect(valNumber.validate(createFakeControl(10))).toBeNull();
    });

    it('should not include start', () => {
      const val = new BetweenValidator<number>(0, 10, [false, true]);
      expect(val.validate(createFakeControl(0))).toEqual({ expectedStart: 0, expectedEnd: 10, actual: 0 });
      expect(val.validate(createFakeControl(10))).toBeNull();
    });

    it('should not include end', () => {
      const val = new BetweenValidator<number>(0, 10, [true, false]);
      expect(val.validate(createFakeControl(0))).toBeNull();
      expect(val.validate(createFakeControl(10))).toEqual({ expectedStart: 0, expectedEnd: 10, actual: 10 });
    });
  });

  describe('date', () => {
    it('should return error if value is not between', () => {
      const date = new Date();
      expect(valDate.validate(createFakeControl(date))).toEqual({
        expectedStart: new Date(2020, 1, 14),
        expectedEnd: new Date(2020, 1, 24),
        actual: date,
      });
    });

    it('should return null if value is between', () => {
      expect(valDate.validate(createFakeControl(new Date(2020, 1, 20)))).toBeNull();
    });

    it('should include start and end by default', () => {
      expect(valDate.validate(createFakeControl(new Date(2020, 1, 14)))).toBeNull();
      expect(valDate.validate(createFakeControl(new Date(2020, 1, 24)))).toBeNull();
    });

    it('should not include start', () => {
      const val = new BetweenValidator<Date>(new Date(2020, 1, 14), new Date(2020, 1, 24), [false, true]);
      expect(val.validate(createFakeControl(new Date(2020, 1, 14)))).toEqual({
        expectedStart: new Date(2020, 1, 14),
        expectedEnd: new Date(2020, 1, 24),
        actual: new Date(2020, 1, 14),
      });
      expect(val.validate(createFakeControl(new Date(2020, 1, 24)))).toBeNull();
    });

    it('should not include end', () => {
      const val = new BetweenValidator<Date>(new Date(2020, 1, 14), new Date(2020, 1, 24), [true, false]);
      expect(val.validate(createFakeControl(new Date(2020, 1, 14)))).toBeNull();
      expect(val.validate(createFakeControl(new Date(2020, 1, 24)))).toEqual({
        expectedStart: new Date(2020, 1, 14),
        expectedEnd: new Date(2020, 1, 24),
        actual: new Date(2020, 1, 24),
      });
    });
  });
});
