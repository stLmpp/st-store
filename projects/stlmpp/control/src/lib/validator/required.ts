import { Control } from '../control/control';
import { isArray, isNil, isString } from '@stlmpp/utils';
import { ControlValidator } from './validator';

export class RequiredValidator<T = any> implements ControlValidator<T, boolean> {
  name = 'required';

  attrs = { required: undefined, 'aria-required': true };

  validate({ value }: Control<T>): boolean | null {
    let isInvalid: boolean;
    if (isString(value)) {
      isInvalid = !value;
    } else if (isArray(value)) {
      isInvalid = !value.length;
    } else {
      isInvalid = isNil(value);
    }
    return isInvalid || null;
  }
}
