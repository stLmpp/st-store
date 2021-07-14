import { UrlValidator } from './url';
import { createFakeControl } from '../../util-tests';
import { Nullable } from '../../util';

describe('url validator', () => {
  it('should validate url', () => {
    const validator = new UrlValidator();
    expect(validator.validate(createFakeControl<Nullable<string>>('test'))).not.toBeNull();
    expect(validator.validate(createFakeControl<Nullable<string>>('www.google.com'))).toBeNull();
  });
});
