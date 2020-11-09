import { ControlValidator, ControlValidatorAttributes } from './validator';
import { Control } from '../control';
import { isRegExp } from '@stlmpp/utils';

export interface PatternValidationError {
  expected: string;
  actual: string;
}

export class PatternValidator implements ControlValidator<string, PatternValidationError> {
  constructor(pattern: string | RegExp) {
    if (isRegExp(pattern)) {
      this.attrs = { pattern: pattern.source };
      this.reg = pattern;
    } else {
      this.attrs = { pattern };
      this.reg = new RegExp(pattern);
    }
  }

  attrs: ControlValidatorAttributes;
  name = 'pattern';

  private reg: RegExp;

  validate({ value }: Control<string>): PatternValidationError | null {
    if (!value) {
      return null;
    }
    return !this.reg.test(value) ? { actual: value, expected: this.reg.source } : null;
  }
}
