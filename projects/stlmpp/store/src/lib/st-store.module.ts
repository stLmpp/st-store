import { ModuleWithProviders, NgModule } from '@angular/core';
import { environment } from './environment';
import { StateService } from './state/state.service';

export interface StStoreModuleConfig {
  /**
   * @description if true, disable the deep copy and deep freeze
   */
  production?: boolean;
  /**
   * @description if false, disable the deep copy
   */
  copyData?: boolean;
  /**
   * @description if false, disable the deep freeze
   */
  freezeData?: boolean;
}

@NgModule()
export class StStoreModule {
  static forRoot(config?: StStoreModuleConfig): ModuleWithProviders<StStoreModule> {
    environment.isDev = !config?.production;
    environment.copyData = config?.copyData ?? true;
    environment.freezeData = config?.freezeData ?? true;
    return {
      ngModule: StStoreModule,
      providers: [StateService],
    };
  }
}
