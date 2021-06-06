import { NgModule } from '@angular/core';
import { GetPipe } from './get.pipe';

const DECLARATIONS = [GetPipe];

@NgModule({
  declarations: [...DECLARATIONS],
  exports: [...DECLARATIONS],
})
export class StUtilsObjectModule {}
