import { ControlValidator, ControlValidatorAttributes } from '../validator';
import { Control } from '../../control/control';
import { isRegExp } from '@stlmpp/utils';
import { Directive, HostBinding, Input } from '@angular/core';

export interface PatternValidationError {
  expected: string;
  actual: string;
}

@Directive()
export abstract class AbstractPatternValidator extends ControlValidator<string, PatternValidationError> {
  @HostBinding('attr.pattern')
  get patternAttr(): string {
    return this.attrs.pattern ? '' + this.attrs.pattern : '';
  }

  @Input()
  set pattern(pattern: string | RegExp) {
    if (isRegExp(pattern)) {
      this.attrs = { pattern: pattern.source };
      this.regExp = pattern;
    } else {
      this.attrs = { pattern };
      this.regExp = new RegExp(pattern);
    }
  }

  attrs: ControlValidatorAttributes = {};
  name = 'pattern';

  protected regExp!: RegExp;

  validate({ value }: Control<string>): PatternValidationError | null {
    if (!value) {
      return null;
    }
    return !this.regExp.test(value) ? { actual: value, expected: this.regExp.source } : null;
  }
}

export class PatternValidator extends AbstractPatternValidator {
  constructor(pattern: string | RegExp) {
    super();
    this.pattern = pattern;
  }
}
