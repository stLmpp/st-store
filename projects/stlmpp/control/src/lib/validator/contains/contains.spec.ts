import { ContainsValidator } from './contains';
import { createFakeControl } from '../../util-tests';
import { Nullable } from '../../util';

describe('contains validator', () => {
  let valString: ContainsValidator;

  beforeEach(() => {
    valString = new ContainsValidator('A');
  });

  it('should not validate is value is falsy', () => {
    expect(valString.validate(createFakeControl<Nullable<string>>(''))).toBeNull();
  });

  it('should validate is value contains', () => {
    expect(valString.validate(createFakeControl<Nullable<string>>('TEST A'))).toBeNull();
    expect(valString.validate(createFakeControl<Nullable<string>>('B'))).toBeTrue();
  });
});
