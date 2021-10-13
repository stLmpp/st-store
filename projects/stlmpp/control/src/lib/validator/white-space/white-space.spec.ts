import { createFakeControl } from '../../util-tests';
import { WhiteSpaceValidator } from './white-space';

describe('white space validator', () => {
  it('should validate', () => {
    const validator = new WhiteSpaceValidator();
    expect(validator.validate(createFakeControl<string | null | undefined>(''))).toBeNull();
    expect(validator.validate(createFakeControl<string | null | undefined>('     '))).toBeTrue();
    expect(validator.validate(createFakeControl<string | null | undefined>('TEST'))).toBeNull();
    expect(validator.validate(createFakeControl<string | null | undefined>(null))).toBeNull();
  });
});
