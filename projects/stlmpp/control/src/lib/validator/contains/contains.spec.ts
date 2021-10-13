import { ContainsValidator } from './contains';
import { createFakeControl } from '../../util-tests';

describe('contains validator', () => {
  let valString: ContainsValidator;

  beforeEach(() => {
    valString = new ContainsValidator('A');
  });

  it('should not validate is value is falsy', () => {
    expect(valString.validate(createFakeControl<string | null | undefined>(''))).toBeNull();
  });

  it('should validate is value contains', () => {
    expect(valString.validate(createFakeControl<string | null | undefined>('TEST A'))).toBeNull();
    expect(valString.validate(createFakeControl<string | null | undefined>('B'))).toBeTrue();
  });
});
