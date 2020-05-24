import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterQuery } from './router.query';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [RouterModule],
})
export class StRouterModule {
  static forRoot(): ModuleWithProviders<StRouterModule> {
    return {
      ngModule: StRouterModule,
      providers: [RouterQuery],
    };
  }
}
