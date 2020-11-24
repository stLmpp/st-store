import { ControlValidator, ControlValidatorAttributes } from '../validator';
import { Control } from '../../control/control';

export abstract class AbstractRequiredTrueValidator extends ControlValidator<boolean, boolean> {
  name = 'requiredTrue';

  attrs: ControlValidatorAttributes = { required: undefined, 'aria-required': true };

  validate({ value }: Control<boolean>): boolean | null {
    return value !== true || null;
  }
}

export class RequiredTrueValidator extends AbstractRequiredTrueValidator {}
