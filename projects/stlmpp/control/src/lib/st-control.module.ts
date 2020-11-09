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
import { ControlValueText } from './control-value/control-value-text';
import { ControlValueSelect } from './control-value/control-value-select';

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
    ControlValueText,
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
    FormSubmitDirective,
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
