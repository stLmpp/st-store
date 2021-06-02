import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'max' })
export class MaxPipe implements PipeTransform {
  transform(value: number, ...args: number[]): number {
    return Math.max(value, ...args);
  }
}
