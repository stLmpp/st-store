import { NgModule } from '@angular/core';
import { ControlStatusDirective } from './control-status/control-status.directive';

@NgModule({
  declarations: [ControlStatusDirective],
  exports: [ControlStatusDirective],
})
export class StControlCommonModule {}
