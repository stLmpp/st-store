import { ControlValidator, ControlValidatorAttributes } from '../validator';
import { Control } from '../../control/control';
import { Nullable } from '../../util';

const EMAIL_REGEXP =
  /^(?=.{1,254}$)(?=.{1,64}@)[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-zA-Z0-9!#$%&'*+/=?^_`{|}~-]+)*@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export abstract class AbstractEmailValidator extends ControlValidator<Nullable<string>, boolean> {
  readonly name: string = 'email';
  override attrs: ControlValidatorAttributes = { email: undefined };

  validate({ value }: Control<Nullable<string>>): boolean | null {
    return (value && !EMAIL_REGEXP.test(value)) || null;
  }
}

export class EmailValidator extends AbstractEmailValidator {}
