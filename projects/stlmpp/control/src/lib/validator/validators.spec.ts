import { Validators } from './validators';
import { RequiredValidator } from './required/required';
import { AsyncValidator } from '../util-tests';
import { RequiredTrueValidator } from './required/required-true';
import { BetweenValidator } from './between/between';
import { LesserValidator } from './greater-lesser/lesser';
import { GreaterValidator } from './greater-lesser/greater';
import { UrlValidator } from './pattern/url';
import { MaxLengthValidator } from './length/max-length';
import { MinLengthValidator } from './length/min-length';
import { MaxValidator } from './max-min/max';
import { MinValidator } from './max-min/min';
import { EmailValidator } from './pattern/email';
import { PatternValidator } from './pattern/pattern';
import { ComposeValidator } from './compose/compose';
import { ComposeAsyncValidator } from './compose/compose-async';
import { ContainsValidator } from './contains/contains';
import { SibblingEqualsValidator } from './other/sibbling-equals';
import { WhiteSpaceValidator } from './white-space/white-space';

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
  it('should return whiteSpace validator', () => {
    expect(Validators.whiteSpace).toBeInstanceOf(WhiteSpaceValidator);
  });
});
