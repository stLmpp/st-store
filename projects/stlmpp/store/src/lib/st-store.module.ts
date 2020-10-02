import { ModuleWithProviders, NgModule } from '@angular/core';
import { environment } from './environment';

export interface StStoreModuleConfig {
  production?: boolean;
  copyData?: boolean;
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
      providers: [],
    };
  }
}
