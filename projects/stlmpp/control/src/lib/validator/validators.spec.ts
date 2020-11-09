import { Validators } from './validators';
import { RequiredValidator } from './required';
import { AsyncValidator } from '../util-tests';
import { RequiredTrueValidator } from './required-true';
import { BetweenValidator } from './between';
import { LesserValidator } from './lesser';
import { GreaterValidator } from './greater';
import { UrlValidator } from './url';
import { MaxLengthValidator } from './max-length';
import { MinLengthValidator } from './min-length';
import { MaxValidator } from './max';
import { MinValidator } from './min';
import { EmailValidator } from './email';
import { PatternValidator } from './pattern';
import { ComposeValidator } from './compose';
import { ComposeAsyncValidator } from './compose-async';
import { ContainsValidator } from './contains';
import { SibblingEqualsValidator } from './sibbling-equals';

describe('validators', () => {
  it('should return required validator', () => {
    expect(Validators.required).toBeInstanceOf(RequiredValidator);
  });

  it('should return maxLength validator', () => {
    expect(Validators.maxLength(1)).toBeInstanceOf(MaxLengthValidator);
  });
  it('should return minLength validator', () => {
    expect(Validators.minLength(1)).toBeInstanceOf(MinLengthValidator);
  });
  it('should return max validator', () => {
    expect(Validators.max(1)).toBeInstanceOf(MaxValidator);
  });
  it('should return min validator', () => {
    expect(Validators.min(1)).toBeInstanceOf(MinValidator);
  });
  it('should return email validator', () => {
    expect(Validators.email).toBeInstanceOf(EmailValidator);
  });
  it('should return pattern validator', () => {
    expect(Validators.pattern('A')).toBeInstanceOf(PatternValidator);
  });
  it('should return compose validator', () => {
    expect(Validators.compose(Validators.required)).toBeInstanceOf(ComposeValidator);
  });
  it('should return composeAsync validator', () => {
    expect(Validators.composeAsync(new AsyncValidator())).toBeInstanceOf(ComposeAsyncValidator);
  });
  it('should return contains validator', () => {
    expect(Validators.contains('A')).toBeInstanceOf(ContainsValidator);
  });
  it('should return sibblingEquals validator', () => {
    expect(Validators.sibblingEquals('a')).toBeInstanceOf(SibblingEqualsValidator);
  });
  it('should return url validator', () => {
    expect(Validators.url).toBeInstanceOf(UrlValidator);
  });
  it('should return greater validator', () => {
    expect(Validators.greater(1)).toBeInstanceOf(GreaterValidator);
  });
  it('should return lesser validator', () => {
    expect(Validators.lesser(1)).toBeInstanceOf(LesserValidator);
  });
  it('should return between validator', () => {
    expect(Validators.between(1, 2)).toBeInstanceOf(BetweenValidator);
  });
  it('should return requiredTrue validator', () => {
    expect(Validators.requiredTrue).toBeInstanceOf(RequiredTrueValidator);
  });
});
