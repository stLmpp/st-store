import { UrlValidator } from './url';
import { createFakeControl } from '../util-tests';

describe('url validator', () => {
  it('should validate url', () => {
    const validator = new UrlValidator();
    expect(validator.validate(createFakeControl('teste'))).not.toBeNull();
    expect(validator.validate(createFakeControl('www.google.com'))).toBeNull();
  });
});
