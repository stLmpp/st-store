import { ModuleWithProviders, NgModule } from '@angular/core';
import { ControlDirective, ControlNameDirective } from './control';
import { ControlArrayNameDirective } from './control-array';
import { ControlError, ControlErrorCase } from './control-error';
import { ControlGroupDirective, ControlGroupNameDirective } from './control-group';
import {
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
  ControlValueText,
} from './control-value';
import { ControlBuilder } from './control-builder';
import { FormSubmitDirective } from './form-submit.directive';

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
    ControlValueFile,
    ControlValueNumber,
    ControlValueRadio,
    ControlValueRadioGroup,
    ControlValueRadioStandalone,
    ControlValueSelect,
    ControlValueSelectMultiple,
    ControlValueSelectOption,
    ControlValueText,
    ControlValueDate,
    FormSubmitDirective,
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
    ControlValueFile,
    ControlValueNumber,
    ControlValueRadio,
    ControlValueRadioGroup,
    ControlValueRadioStandalone,
    ControlValueSelect,
    ControlValueSelectMultiple,
    ControlValueSelectOption,
    ControlValueText,
    ControlValueDate,
    FormSubmitDirective,
  ],
  providers: [],
})
export class StControlModule {
  static forRoot(): ModuleWithProviders<StControlModule> {
    return {
      ngModule: StControlModule,
      providers: [ControlBuilder],
    };
  }
}
