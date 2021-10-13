import { ControlValidator, ControlValidatorAttributes } from '../validator';
import { Control } from '../../control/control';

export abstract class AbstractRequiredTrueValidator extends ControlValidator<boolean | null | undefined, boolean> {
  readonly name: string = 'requiredTrue';

  override attrs: ControlValidatorAttributes = { required: undefined, 'aria-required': true };

  validate({ value }: Control<boolean | null | undefined>): boolean | null {
    return value !== true || null;
  }
}

export class RequiredTrueValidator extends AbstractRequiredTrueValidator {}
