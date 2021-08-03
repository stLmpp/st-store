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
import { StControlCommonModule } from './st-control-common.module';
import { StControlValueModule } from './st-control-value.module';

@NgModule({
  imports: [StControlCommonModule, StControlValueModule],
  declarations: [
    ControlDirective,
    ControlNameDirective,
    ControlArrayNameDirective,
    ControlError,
    ControlErrorCase,
    ControlGroupDirective,
    ControlGroupNameDirective,
    FormSubmitDirective,
  ],
  exports: [
    StControlCommonModule,
    StControlValueModule,
    ControlDirective,
    ControlNameDirective,
    ControlArrayNameDirective,
    ControlError,
    ControlErrorCase,
    ControlGroupDirective,
    ControlGroupNameDirective,
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
