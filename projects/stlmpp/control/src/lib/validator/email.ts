import { ControlValidator } from './validator';
import { Control } from '../control';

const EMAIL_REGEXP = /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export class EmailValidator implements ControlValidator<string, boolean> {
  attrs = { email: undefined };

  name = 'email';

  validate({ value }: Control<string>): boolean | null {
    return (value && !EMAIL_REGEXP.test(value)) || null;
  }
}
