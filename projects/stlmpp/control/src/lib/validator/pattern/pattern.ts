import { ControlValidator, ControlValidatorAttributes } from '../validator';
import { Control } from '../../control/control';
import { isRegExp } from 'st-utils';
import { Directive, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Nullable } from '../../util';

export interface PatternValidationError {
  expected: string;
  actual: Nullable<string>;
}

@Directive()
export abstract class AbstractPatternValidator
  extends ControlValidator<Nullable<string>, PatternValidationError>
  implements OnChanges
{
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

  protected regExp!: RegExp;

  abstract override readonly name: string;

  override attrs: ControlValidatorAttributes = {};

  validate({ value }: Control<Nullable<string>>): PatternValidationError | null {
    if (!value) {
      return null;
    }
    return !this.regExp.test(value) ? { actual: value, expected: this.regExp.source } : null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const patternChange = changes.pattern;
    if (patternChange && !patternChange.isFirstChange()) {
      this.validationChange$.next();
    }
  }
}

export class PatternValidator extends AbstractPatternValidator {
  constructor(pattern: string | RegExp) {
    super();
    this.pattern = pattern;
  }

  readonly name = 'pattern';
}
