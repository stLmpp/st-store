import { UrlValidator } from './url';
import { createFakeControl } from '../../util-tests';

describe('url validator', () => {
  it('should validate url', () => {
    const validator = new UrlValidator();
    expect(validator.validate(createFakeControl<string | null | undefined>('test'))).not.toBeNull();
    expect(validator.validate(createFakeControl<string | null | undefined>('www.google.com'))).toBeNull();
  });
});
