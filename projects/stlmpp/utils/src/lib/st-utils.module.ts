import { ModuleWithProviders, NgModule } from '@angular/core';
import { OrderByPipe } from './order-by';
import { GetDeepPipe } from './get-deep';

const PIPES = [OrderByPipe, GetDeepPipe];

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
