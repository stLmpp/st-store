import { ControlValidator, ControlValidatorAttributes } from '../validator';
import { Control } from '../../control/control';
import { Nullable } from '../../util';

export abstract class AbstractRequiredTrueValidator extends ControlValidator<Nullable<boolean>, boolean> {
  readonly name = 'requiredTrue';

  override attrs: ControlValidatorAttributes = { required: undefined, 'aria-required': true };

  validate({ value }: Control<Nullable<boolean>>): boolean | null {
    return value !== true || null;
  }
}

export class RequiredTrueValidator extends AbstractRequiredTrueValidator {}
