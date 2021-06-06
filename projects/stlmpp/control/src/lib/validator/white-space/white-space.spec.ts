import { createFakeControl } from '../../util-tests';
import { Nullable } from '../../util';
import { WhiteSpaceValidator } from './white-space';

describe('white space validator', () => {
  it('should validate', () => {
    const validator = new WhiteSpaceValidator();
    expect(validator.validate(createFakeControl<Nullable<string>>(''))).toBeNull();
    expect(validator.validate(createFakeControl<Nullable<string>>('     '))).toBeTrue();
    expect(validator.validate(createFakeControl<Nullable<string>>('TESTE'))).toBeNull();
    expect(validator.validate(createFakeControl<Nullable<string>>(null))).toBeNull();
  });
});
