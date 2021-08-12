import { NgModule } from '@angular/core';
import { OrderByPipe } from './order-by';
import { SumByPipe, SumPipe } from './sum';
import { GroupByPipe } from './group-by';
import { AnyPipe } from './any.pipe';
import { JoinPipe } from './join.pipe';
import { SearchPipe } from './search.pipe';

const DECLARATIONS = [OrderByPipe, SumPipe, SumByPipe, GroupByPipe, AnyPipe, JoinPipe, SearchPipe];

@NgModule({
  declarations: [...DECLARATIONS],
  exports: [...DECLARATIONS],
})
export class StUtilsArrayModule {}
