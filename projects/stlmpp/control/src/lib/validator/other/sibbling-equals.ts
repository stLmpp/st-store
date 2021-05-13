import { ControlValidator } from '../validator';
import { Control } from '../../control/control';
import { isControl } from '../../util';

export interface SibblingEqualsValidationError {
  sibbling: any;
  value: any;
}

export class SibblingEqualsValidator<T = any> extends ControlValidator<T, SibblingEqualsValidationError> {
  constructor(private sibblingName: string, private compareWith: (valueA: T, valueB: T) => boolean = Object.is) {
    super();
  }

  name = 'sibblingEquals';

  validate(control: Control<T>): SibblingEqualsValidationError | null {
    const parent = control.parent;
    if (!parent) {
      return null;
    }
    const sibbling = parent.get(this.sibblingName);
    if (!sibbling || !isControl(sibbling)) {
      return null;
    }
    const value = control.value;
    const isEqual = this.compareWith(value, sibbling.value);
    if (isEqual) {
      sibbling.removeError(this.name);
    } else {
      sibbling.addError(this.name, { sibbling: control.value, value: sibbling.value });
    }
    return !isEqual ? { sibbling: sibbling.value, value: control.value } : null;
  }
}
