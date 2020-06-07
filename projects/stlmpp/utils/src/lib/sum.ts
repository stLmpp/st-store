import { Pipe, PipeTransform } from '@angular/core';
import { map } from 'rxjs/operators';
import { getDeep } from './get-deep';

export function sum(values: number[]): number {
  if (!values?.length) return 0;
  return values.reduce((acc, item) => acc + +(item ?? 0), 0);
}

export function sumBy<T = any>(values: T[], key: keyof T | (keyof T)[]): number {
  if (!values?.length || !key) return 0;
  return values.reduce((acc, item) => acc + +(getDeep(item, key as string[]) ?? 0), 0);
}

export const sumOperator = () => map<number[], number>(values => sum(values));
export const sumByOperator = <T>(key: keyof T | (keyof T)[]) =>
  map<T[], number>(values => sumBy(values, key));

@Pipe({ name: 'stSumBy' })
export class SumByPipe implements PipeTransform {
  transform<T = any>(value: T[], key: keyof T | (keyof T)[]): number {
    if (!value?.length || !key) return 0;
    return sumBy(value, key);
  }
}

@Pipe({ name: 'stSum' })
export class SumPipe implements PipeTransform {
  transform(value: number[]): number {
    return sum(value);
  }
}
