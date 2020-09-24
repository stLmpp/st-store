import { ModuleWithProviders, NgModule } from '@angular/core';
import { OrderByPipe } from './order-by';
import { GetDeepPipe } from './get-deep';
import { DefaultPipe } from './default';
import { SumByPipe, SumPipe } from './sum';
import { GroupByPipe } from './group-by';

const PIPES = [OrderByPipe, GetDeepPipe, DefaultPipe, SumByPipe, SumPipe, GroupByPipe];

@NgModule({
  declarations: [...PIPES],
  exports: [...PIPES],
})
export class StUtilsModule {
  static forRoot(): ModuleWithProviders<StUtilsModule> {
    return {
      ngModule: StUtilsModule,
    };
  }
}
