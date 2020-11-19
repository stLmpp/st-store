import { ControlValidator } from './validator';
import { Control } from '../control/control';
import { coerceArray, isNil } from '@stlmpp/utils';
import { isObjectEmpty } from '@stlmpp/utils';

export class ComposeValidator implements ControlValidator<any, Record<string, any>> {
  constructor(validators: ControlValidator[]) {
    this.validators = validators.filter(validator => !validator.async);
    for (const validator of this.validators) {
      if (validator.attrs) {
        this.attrs = { ...this.attrs, ...validator.attrs };
      }
      if (validator.classes) {
        this.classes.push(...coerceArray(validator.classes));
      }
    }
  }

  private readonly validators: ControlValidator[];
  attrs: Record<string, string | number | boolean | undefined> = {};
  classes: string[] = [];
  name = 'compose';

  validate(control: Control): Record<string, any> | null {
    const errors = this.validators.reduce((acc, validator) => {
      const error = validator.validate(control);
      if (!isNil(error)) {
        return { ...acc, [validator.name]: error };
      }
      return acc;
    }, {});
    return isObjectEmpty(errors) ? null : errors;
  }
}
