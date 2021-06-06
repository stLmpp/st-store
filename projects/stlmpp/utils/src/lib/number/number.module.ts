import { NgModule } from '@angular/core';
import { MinPipe } from './min.pipe';
import { MaxPipe } from './max.pipe';

const DECLARATIONS = [MinPipe, MaxPipe];

@NgModule({
  declarations: [...DECLARATIONS],
  exports: [...DECLARATIONS],
})
export class StUtilsNumberModule {}
