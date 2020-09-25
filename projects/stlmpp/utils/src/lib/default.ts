import { Inject, InjectionToken, Optional, Pipe, PipeTransform } from '@angular/core';

export type DefaultPipeType = 'strict' | 'loose';
export const DEFAULT_PIPE_TYPE = new InjectionToken<DefaultPipeType>('DEFAULT_PIPE_TYPE');

// @dynamic
@Pipe({ name: 'stDefault' })
export class DefaultPipe implements PipeTransform {
  constructor(@Optional() @Inject(DEFAULT_PIPE_TYPE) private defaultPipeType: DefaultPipeType) {}

  transform<T = any, R = any>(value: T, defaultValue: R, type?: DefaultPipeType): T | R {
    type ??= this.defaultPipeType ?? 'strict';
    if (type === 'strict') {
      return value ?? defaultValue;
    } else {
      return !!value ? value : defaultValue;
    }
  }
}
