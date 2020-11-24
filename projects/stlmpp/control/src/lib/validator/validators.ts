import { RequiredValidator } from './required/required';
import { LengthValidationError, MaxLengthValidator } from './length/max-length';
import { MinLengthValidator } from './length/min-length';
import { MaxMinValidationError, MaxValidator } from './max-min/max';
import { MinValidator } from './max-min/min';
import { EmailValidator } from './pattern/email';
import { PatternValidationError, PatternValidator } from './pattern/pattern';
import { ControlValidator } from './validator';
import { ComposeValidator } from './compose/compose';
import { ComposeAsyncValidator } from './compose/compose-async';
import { ContainsValidator } from './contains/contains';
import { SibblingEqualsValidator, SibblingEqualsValidationError } from './other/sibbling-equals';
import { UrlValidator } from './pattern/url';
import { GreaterValidationError, GreaterValidator } from './greater-lesser/greater';
import { LesserValidationError, LesserValidator } from './greater-lesser/lesser';
import { BetweenValidator } from './between/between';
import { RequiredTrueValidator } from './required/required-true';

// @dynamic
export class Validators {
  static get required(): RequiredValidator {
    return new RequiredValidator();
  }
  static maxLength<T extends string | any[]>(maxLength: number): MaxLengthValidator<T> {
    return new MaxLengthValidator<T>(maxLength);
  }
  static minLength<T extends string | any[]>(minLength: number): MinLengthValidator<T> {
    return new MinLengthValidator<T>(minLength);
  }
  static max<T extends number | Date>(max: T | string): MaxValidator<T> {
    return new MaxValidator<T>(max);
  }
  static min<T extends number | Date>(min: T | string): MinValidator<T> {
    return new MinValidator<T>(min);
  }
  static get email(): EmailValidator {
    return new EmailValidator();
  }
  static pattern(pattern: string | RegExp): PatternValidator {
    return new PatternValidator(pattern);
  }
  static compose(...validators: ControlValidator[]): ComposeValidator {
    return new ComposeValidator(validators);
  }
  static composeAsync(...validators: ControlValidator[]): ComposeAsyncValidator {
    return new ComposeAsyncValidator(validators);
  }
  static contains<T extends string | any[] = any, U = T extends Array<infer RealType> ? RealType : string>(
    value: U,
    compareWith?: (valueA: U, valueB: U) => boolean
  ): ContainsValidator<T, U> {
    return new ContainsValidator<T, U>(value, compareWith);
  }
  static sibblingEquals<T = any>(
    sibblingName: string,
    compareWith?: (valueA: T | null | undefined, valueB: T | null | undefined) => boolean
  ): SibblingEqualsValidator<T> {
    return new SibblingEqualsValidator<T>(sibblingName, compareWith);
  }
  static get url(): UrlValidator {
    return new UrlValidator();
  }
  static greater<T extends Date | number>(greater: T): GreaterValidator<T> {
    return new GreaterValidator<T>(greater);
  }
  static lesser<T extends Date | number>(lesser: T): LesserValidator<T> {
    return new LesserValidator<T>(lesser);
  }
  static between<T extends Date | number>(start: T, end: T, inclusiveness?: [boolean, boolean]): BetweenValidator<T> {
    return new BetweenValidator<T>(start, end, inclusiveness);
  }
  static get requiredTrue(): RequiredTrueValidator {
    return new RequiredTrueValidator();
  }
}

export interface ValidatorsModel {
  required: boolean;
  maxLength: LengthValidationError;
  minLength: LengthValidationError;
  max: MaxMinValidationError<Date | number>;
  min: MaxMinValidationError<Date | number>;
  email: boolean;
  pattern: PatternValidationError;
  compose: Record<string, any>;
  composeAsync: Record<string, any>;
  contains: boolean;
  sibblingEquals: SibblingEqualsValidationError;
  url: boolean;
  greater: GreaterValidationError<Date | number>;
  lesser: LesserValidationError<Date | number>;
  requiredTrue: boolean;
  [name: string]: any;
}
