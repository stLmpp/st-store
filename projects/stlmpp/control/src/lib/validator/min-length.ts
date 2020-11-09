import { Control } from '../control';
import { ControlValidator, ControlValidatorAttributes } from './validator';
import { LengthValidationError } from './max-length';

export class MinLengthValidator<T extends string | any[] = any> implements ControlValidator<T, LengthValidationError> {
  constructor(private minLength: number) {
    this.attrs = { minLength };
  }

  name = 'minLength';

  attrs: ControlValidatorAttributes;

  validate({ value }: Control<T>): LengthValidationError | null {
    if (!value) {
      return null;
    }
    const length = value.length;
    return length < this.minLength ? { actual: length, required: this.minLength } : null;
  }
}
