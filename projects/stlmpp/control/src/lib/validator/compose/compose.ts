import { ControlValidator } from '../validator';
import { Control } from '../../control/control';
import { coerceArray, isNotNil, isObjectEmpty } from 'st-utils';

export class ComposeValidator extends ControlValidator<any, Record<string, any>> {
  constructor(validators: ControlValidator[]) {
    super();
    this._validators = validators.filter(validator => !validator.async);
    for (const validator of this._validators) {
      if (validator.attrs) {
        this.attrs = { ...this.attrs, ...validator.attrs };
      }
      if (validator.classes) {
        this.classes.push(...coerceArray(validator.classes));
      }
    }
  }

  private readonly _validators: ControlValidator[];

  override attrs: Record<string, string | number | boolean | undefined> = {};
  override classes: string[] = [];
  readonly name = 'compose';

  validate(control: Control): Record<string, any> | null {
    const errors = this._validators.reduce((acc, validator) => {
      const error = validator.validate(control);
      if (isNotNil(error)) {
        return { ...acc, [validator.name]: error };
      }
      return acc;
    }, {});
    return isObjectEmpty(errors) ? null : errors;
  }
}
