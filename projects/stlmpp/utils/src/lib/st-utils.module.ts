import { ModuleWithProviders, NgModule } from '@angular/core';
import { OrderByPipe } from './order-by';

@NgModule({
  declarations: [OrderByPipe],
  exports: [OrderByPipe],
})
export class StUtilsModule {
  static forRoot(): ModuleWithProviders<StUtilsModule> {
    return {
      ngModule: StUtilsModule,
    };
  }
}
