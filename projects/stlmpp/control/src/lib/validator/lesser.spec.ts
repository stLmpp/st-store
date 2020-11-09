import { createFakeControl } from '../util-tests';
import { LesserValidator } from './lesser';

describe('lesser validator', () => {
  let valNumber: LesserValidator<number>;
  let valDate: LesserValidator<Date>;

  beforeEach(() => {
    valNumber = new LesserValidator<number>(5);
    valDate = new LesserValidator<Date>(new Date(2020, 1, 14));
  });

  it('should not validated if value is falsey', () => {
    expect(valNumber.validate(createFakeControl(null as any))).toBeNull();
  });

  describe('number', () => {
    it('should return null if number is lesser', () => {
      expect(valNumber.validate(createFakeControl(4))).toBeNull();
    });

    it('should return error if number is not lesser', () => {
      expect(valNumber.validate(createFakeControl(6))).toEqual({ expectedLesserThan: 5, actual: 6 });
    });
  });

  describe('date', () => {
    it('should return null if date is lesser', () => {
      expect(valDate.validate(createFakeControl(new Date(2020, 1, 13)))).toBeNull();
    });

    it('should return error if date is not lesser', () => {
      expect(valDate.validate(createFakeControl(new Date(2020, 1, 15)))).toEqual({
        expectedLesserThan: new Date(2020, 1, 14),
        actual: new Date(2020, 1, 15),
      });
    });
  });
});
