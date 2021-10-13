import { EmailValidator } from './email';
import { createFakeControl } from '../../util-tests';

describe('email validator', () => {
  let validator: EmailValidator;

  beforeEach(() => {
    validator = new EmailValidator();
  });

  it('should return null if valid email', () => {
    expect(validator.validate(createFakeControl<string | null | undefined>('a@a.com'))).toBeNull();
  });

  it('should return true if invalid email', () => {
    expect(validator.validate(createFakeControl<string | null | undefined>('a'))).toBeTrue();
  });

  it('should not validated if empty value', () => {
    expect(validator.validate(createFakeControl<string | null | undefined>(''))).toBeNull();
  });
});
