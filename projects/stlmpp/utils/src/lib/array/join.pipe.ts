import { Pipe, PipeTransform } from '@angular/core';
import { Primitive } from 'type-fest';

@Pipe({ name: 'join' })
export class JoinPipe implements PipeTransform {
  transform<T extends Record<any, any>, K extends keyof T>(value: T[], key: K, char?: string): string;
  transform<T extends Primitive>(value: T[], key?: '.', char?: string): string;
  transform<T, K extends keyof T>(value: T[], key: K | '.' = '.', char = ', '): string {
    return (key !== '.' ? value.map(item => item[key]) : value).join(char);
  }
}
