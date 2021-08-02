import { NgModule } from '@angular/core';
import { ControlValueCheckbox } from './control-value/control-value-checkbox';
import { ControlValueColor } from './control-value/control-value-color';
import { ControlValueDate } from './control-value/control-value-date';
import { ControlValueFile } from './control-value/control-value-file';
import { ControlValueNumber } from './control-value/control-value-number';
import { ControlValueRadio } from './control-value/control-value-radio';
import { ControlValueRadioGroup } from './control-value/control-value-radio-group';
import { ControlValueRadioStandalone } from './control-value/control-value-radio-standalone';
import { ControlValueSelect } from './control-value/control-value-select';
import { ControlValueSelectMultiple } from './control-value/control-value-select-multiple';
import { ControlValueSelectOption } from './control-value/control-value-select-option';
import { ControlValueDefault } from './control-value/control-value-default';

@NgModule({
  declarations: [
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
  ],
  exports: [
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
  ],
})
export class StControlValueModule {}
