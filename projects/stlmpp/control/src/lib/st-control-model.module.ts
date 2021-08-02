import { NgModule } from '@angular/core';
import { ModelDirective } from './model/model.directive';
import { BetweenValidatorDirective } from './validator/between/between.directive';
import { ContainsValidatorDirective } from './validator/contains/contains.directive';
import { GreaterValidatorDirective } from './validator/greater-lesser/greater.directive';
import { LesserValidatorDirective } from './validator/greater-lesser/lesser.directive';
import { MaxLengthValidatorDirective } from './validator/length/max-length.directive';
import { MinLengthValidatorDirective } from './validator/length/min-length.directive';
import { MaxValidatorDirective } from './validator/max-min/max.directive';
import { MinValidatorDirective } from './validator/max-min/min.directive';
import { EmailValidatorDirective } from './validator/pattern/email.directive';
import { PatternValidatorDirective } from './validator/pattern/pattern.directive';
import { UrlValidatorDirective } from './validator/pattern/url.directive';
import { RequiredValidatorDirective } from './validator/required/required.directive';
import { RequiredTrueValidatorDirective } from './validator/required/required-true.directive';
import { WhiteSpaceValidatorDirective } from './validator/white-space/white-space.directive';
import { StControlCommonModule } from './st-control-common.module';
import { StControlValueModule } from './st-control-value.module';

@NgModule({
  imports: [StControlCommonModule, StControlValueModule],
  declarations: [
    ModelDirective,
    BetweenValidatorDirective,
    ContainsValidatorDirective,
    GreaterValidatorDirective,
    LesserValidatorDirective,
    MaxLengthValidatorDirective,
    MinLengthValidatorDirective,
    MaxValidatorDirective,
    MinValidatorDirective,
    EmailValidatorDirective,
    PatternValidatorDirective,
    UrlValidatorDirective,
    RequiredValidatorDirective,
    RequiredTrueValidatorDirective,
    WhiteSpaceValidatorDirective,
  ],
  exports: [
    StControlCommonModule,
    StControlValueModule,
    ModelDirective,
    BetweenValidatorDirective,
    ContainsValidatorDirective,
    GreaterValidatorDirective,
    LesserValidatorDirective,
    MaxLengthValidatorDirective,
    MinLengthValidatorDirective,
    MaxValidatorDirective,
    MinValidatorDirective,
    EmailValidatorDirective,
    PatternValidatorDirective,
    UrlValidatorDirective,
    RequiredValidatorDirective,
    RequiredTrueValidatorDirective,
    WhiteSpaceValidatorDirective,
  ],
})
export class StControlModelModule {}
