import { ContainsValidator } from './contains';
import { createFakeControl } from '../../util-tests';

describe('contains validator', () => {
  let valString: ContainsValidator<string>;
  let valArray: ContainsValidator<string[]>;

  beforeEach(() => {
    valString = new ContainsValidator<string>('A');
    valArray = new ContainsValidator<string[]>('A');
  });

  it('should not validate is value is falsey', () => {
    expect(valString.validate(createFakeControl(''))).toBeNull();
    expect(valArray.validate(createFakeControl(null as any))).toBeNull();
  });

  describe('string', () => {
    it('should validate is value contains', () => {
      expect(valString.validate(createFakeControl('TESTEA'))).toBeNull();
      expect(valString.validate(createFakeControl('B'))).toBeTrue();
    });
  });

  describe('array', () => {
    it('should validate if value contains', () => {
      expect(valArray.validate(createFakeControl(['A', 'B']))).toBeNull();
      expect(valArray.validate(createFakeControl(['B']))).toBeTrue();
    });

    it('should use a custom comparator', () => {
      const val = new ContainsValidator<{ id: number }[]>({ id: 1 }, (valueA, valueB) => valueA.id === valueB.id);
      expect(val.validate(createFakeControl([{ id: 1 }, { id: 2 }]))).toBeNull();
      expect(val.validate(createFakeControl([{ id: 2 }]))).toBeTrue();
    });
  });
});
