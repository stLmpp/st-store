import { ModuleWithProviders, NgModule } from '@angular/core';
import { ControlBuilder } from './control-builder';
import { FormSubmitDirective } from './form-submit.directive';
import { ControlNameDirective } from './control/control-name.directive';
import { ControlDirective } from './control/control.directive';
import { ControlArrayNameDirective } from './control-array/control-array-name.directive';
import { ControlErrorCase } from './control-error/control-error-case';
import { ControlError } from './control-error/control-error';
import { ControlGroupNameDirective } from './control-group/control-group-name.directive';
import { ControlGroupDirective } from './control-group/control-group.directive';
import { ControlValueDate } from './control-value/control-value-date';
import { ControlValueRadioGroup } from './control-value/control-value-radio-group';
import { ControlValueSelectOption } from './control-value/control-value-select-option';
import { ControlValueRadioStandalone } from './control-value/control-value-radio-standalone';
import { ControlValueFile } from './control-value/control-value-file';
import { ControlValueRadio } from './control-value/control-value-radio';
import { ControlValueCheckbox } from './control-value/control-value-checkbox';
import { ControlValueSelectMultiple } from './control-value/control-value-select-multiple';
import { ControlValueColor } from './control-value/control-value-color';
import { ControlValueNumber } from './control-value/control-value-number';
import { ControlValueDefault } from './control-value/control-value-default';
import { ControlValueSelect } from './control-value/control-value-select';
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

@NgModule({
  declarations: [
    ControlDirective,
    ControlNameDirective,
    ControlArrayNameDirective,
    ControlError,
    ControlErrorCase,
    ControlGroupDirective,
    ControlGroupNameDirective,
    ControlValueCheckbox,
    ControlValueColor,
    ControlValueDate,
    ControlValueFile,
    ControlValueNumber,
    ControlValueRadio,
    ControlValueRadioGroup,
    ControlValueRadioStandalone,
    ControlValueSelect,
    ControlValueSelectMultiple,
    ControlValueSelectOption,
    ControlValueDefault,
    FormSubmitDirective,
    // MODEL
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
  ],
  exports: [
    ControlDirective,
    ControlNameDirective,
    ControlArrayNameDirective,
    ControlError,
    ControlErrorCase,
    ControlGroupDirective,
    ControlGroupNameDirective,
    ControlValueCheckbox,
    ControlValueColor,
    ControlValueDate,
    ControlValueFile,
    ControlValueNumber,
    ControlValueRadio,
    ControlValueRadioGroup,
    ControlValueRadioStandalone,
    ControlValueSelect,
    ControlValueSelectMultiple,
    ControlValueSelectOption,
    ControlValueDefault,
    FormSubmitDirective,
    // MODEL
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
  ],
})
export class StControlModule {
  static forRoot(): ModuleWithProviders<StControlModule> {
    return {
      ngModule: StControlModule,
      providers: [ControlBuilder],
    };
  }
}
