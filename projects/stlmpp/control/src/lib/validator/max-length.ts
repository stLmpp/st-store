import { Control } from '../control';
import { ControlValidator, ControlValidatorAttributes } from './validator';

export interface LengthValidationError {
  required: number;
  actual: number;
}

export class MaxLengthValidator<T extends string | any[] = any> implements ControlValidator<T, LengthValidationError> {
  constructor(private maxLength: number) {
    this.attrs = { maxLength };
  }

  name = 'maxLength';

  attrs: ControlValidatorAttributes;

  validate({ value }: Control<T>): LengthValidationError | null {
    if (!value) {
      return null;
    }
    const length = value.length;
    return length > this.maxLength ? { actual: length, required: this.maxLength } : null;
  }
}
