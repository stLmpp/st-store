import { ControlValidator } from '../validator';
import { Control, isControl } from '../../control/control';

export interface SiblingEqualsValidationError {
  sibling: any;
  value: any;
}

export class SiblingEqualsValidator<T = any> extends ControlValidator<T, SiblingEqualsValidationError> {
  constructor(private siblingName: string, private compareWith: (valueA: T, valueB: T) => boolean = Object.is) {
    super();
  }

  readonly name: string = 'siblingEquals';

  validate(control: Control<T>): SiblingEqualsValidationError | null {
    const parent = control.parent;
    if (!parent) {
      return null;
    }
    const sibling = parent.get(this.siblingName);
    if (!sibling || !isControl(sibling)) {
      return null;
    }
    const value = control.value;
    const isEqual = this.compareWith(value, sibling.value);
    if (isEqual) {
      sibling.removeError(this.name);
    } else {
      sibling.addError(this.name, { sibling: control.value, value: sibling.value });
    }
    return !isEqual ? { sibling: sibling.value, value: control.value } : null;
  }
}
