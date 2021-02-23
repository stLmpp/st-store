import { ModuleWithProviders, NgModule } from '@angular/core';
import { OrderByPipe } from './order-by';
import { GetDeepPipe } from './get-deep';
import { DEFAULT_PIPE_TYPE, DefaultPipe, DefaultPipeType } from './default';
import { SumByPipe, SumPipe } from './sum';
import { GroupByPipe } from './group-by';

const PIPES = [OrderByPipe, GetDeepPipe, DefaultPipe, SumByPipe, SumPipe, GroupByPipe];

export interface StUtilsModuleConfig {
  defaultPipeType: DefaultPipeType;
}

@NgModule({
  declarations: [...PIPES],
  exports: [...PIPES],
})
export class StUtilsModule {
  static forRoot(options?: StUtilsModuleConfig): ModuleWithProviders<StUtilsModule> {
    const { defaultPipeType } = { defaultPipeType: 'strict', ...options };
    return { ngModule: StUtilsModule, providers: [{ provide: DEFAULT_PIPE_TYPE, useValue: defaultPipeType }] };
  }

  static forChild(options?: StUtilsModuleConfig): ModuleWithProviders<StUtilsModule> {
    const { defaultPipeType } = { defaultPipeType: 'strict', ...options };
    return { ngModule: StUtilsModule, providers: [{ provide: DEFAULT_PIPE_TYPE, useValue: defaultPipeType }] };
  }
}
