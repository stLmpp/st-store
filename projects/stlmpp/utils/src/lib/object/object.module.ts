import { NgModule } from '@angular/core';
import { GetPipe } from './get.pipe';
import { GetDeepPipe } from './get-deep';

const DECLARATIONS = [GetPipe, GetDeepPipe];

@NgModule({
  declarations: [...DECLARATIONS],
  exports: [...DECLARATIONS],
})
export class StUtilsObjectModule {}
