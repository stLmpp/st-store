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
import { SiblingEqualsValidationError, SiblingEqualsValidator } from './other/sibbling-equals';
import { UrlValidator } from './pattern/url';
import { GreaterValidationError, GreaterValidator } from './greater-lesser/greater';
import { LesserValidationError, LesserValidator } from './greater-lesser/lesser';
import { BetweenValidator } from './between/between';
import { RequiredTrueValidator } from './required/required-true';
import { Nullable } from '../util';
import { WhiteSpaceValidator } from './white-space/white-space';
import { SiblingNotEqualsValidator } from './other/sibling-not-equals';

// @dynamic
export class Validators {
  static get required(): RequiredValidator {
    return new RequiredValidator();
  }
  static maxLength<T extends Nullable<string | any[]>>(maxLength: number): MaxLengthValidator<T> {
    return new MaxLengthValidator<T>(maxLength);
  }
  static minLength<T extends Nullable<string | any[]>>(minLength: number): MinLengthValidator<T> {
    return new MinLengthValidator<T>(minLength);
  }
  static max<T extends Nullable<number | Date>>(max: NonNullable<T> | string): MaxValidator<T> {
    return new MaxValidator<T>(max);
  }
  static min<T extends Nullable<number | Date>>(min: NonNullable<T> | string): MinValidator<T> {
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
  static contains(value: NonNullable<string>): ContainsValidator {
    return new ContainsValidator(value);
  }
  static siblingEquals<T = any>(
    siblingName: string,
    compareWith?: (valueA: T, valueB: T) => boolean
  ): SiblingEqualsValidator<T> {
    return new SiblingEqualsValidator<T>(siblingName, compareWith);
  }
  static siblingNotEquals<T = any>(
    siblingName: string,
    compareWith?: (valueA: T, valueB: T) => boolean
  ): SiblingNotEqualsValidator {
    return new SiblingNotEqualsValidator<T>(siblingName, compareWith);
  }
  static get url(): UrlValidator {
    return new UrlValidator();
  }
  static greater<T extends Nullable<Date | number>>(greater: NonNullable<T>): GreaterValidator<T> {
    return new GreaterValidator<T>(greater);
  }
  static lesser<T extends Nullable<Date | number>>(lesser: NonNullable<T>): LesserValidator<T> {
    return new LesserValidator<T>(lesser);
  }
  static between<T extends Nullable<Date | number>>(
    start: NonNullable<T>,
    end: NonNullable<T>,
    inclusiveness?: [boolean, boolean]
  ): BetweenValidator<T> {
    return new BetweenValidator<T>(start, end, inclusiveness);
  }
  static get requiredTrue(): RequiredTrueValidator {
    return new RequiredTrueValidator();
  }
  static get whiteSpace(): WhiteSpaceValidator {
    return new WhiteSpaceValidator();
  }
}

export interface ValidatorsModel {
  [name: string]: any;
  required: boolean;
  maxLength: LengthValidationError;
  minLength: LengthValidationError;
  max: MaxMinValidationError<Nullable<Date | number>>;
  min: MaxMinValidationError<Nullable<Date | number>>;
  email: boolean;
  pattern: PatternValidationError;
  compose: Record<string, any>;
  composeAsync: Record<string, any>;
  contains: boolean;
  siblingEquals: SiblingEqualsValidationError;
  siblingNotEquals: SiblingEqualsValidationError;
  url: boolean;
  greater: GreaterValidationError<Nullable<Date | number>>;
  lesser: LesserValidationError<Nullable<Date | number>>;
  requiredTrue: boolean;
  whiteSpace: boolean;
}

export type ValidatorsKeys = keyof ValidatorsModel;
