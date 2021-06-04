import { Control } from '../../control/control';
import { isArray, isNil, isString } from 'st-utils';
import { ControlValidator, ControlValidatorAttributes } from '../validator';

export class AbstractRequiredValidator<T = any> extends ControlValidator<T, boolean> {
  readonly name = 'required';

  attrs: ControlValidatorAttributes = { required: undefined, 'aria-required': true };

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

export class RequiredValidator<T = any> extends AbstractRequiredValidator<T> {}
