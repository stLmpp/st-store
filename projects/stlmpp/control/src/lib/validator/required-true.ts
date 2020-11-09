import { ControlValidator } from './validator';
import { Control } from '../control/control';

export class RequiredTrueValidator implements ControlValidator<boolean, boolean> {
  name = 'requiredTrue';

  attrs = { required: undefined, 'aria-required': true };

  validate(control: Control<boolean>): boolean | null {
    return control.value !== true || null;
  }
}
