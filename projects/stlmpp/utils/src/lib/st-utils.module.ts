import { NgModule } from '@angular/core';
import { OrderByPipe } from './order-by';
import { GetDeepPipe } from './get-deep';
import { SumByPipe, SumPipe } from './sum';
import { GroupByPipe } from './group-by';

const PIPES = [OrderByPipe, GetDeepPipe, SumByPipe, SumPipe, GroupByPipe];

@NgModule({
  declarations: [...PIPES],
  exports: [...PIPES],
})
export class StUtilsModule {}
