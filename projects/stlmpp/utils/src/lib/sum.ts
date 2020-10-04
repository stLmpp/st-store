import { Pipe, PipeTransform } from '@angular/core';
import { map } from 'rxjs/operators';
import { isArray, isString } from 'lodash-es';

export function sum(values: number[]): number {
  if (!values?.length) {
    return 0;
  }
  return values.reduce((acc, item) => acc + +(item ?? 0), 0);
}

const isKey = <T>(key: any): key is keyof T => isString(key);

export function sumBy<T = any>(values: T[], key: keyof T | (keyof T)[]): number {
  if (!values?.length || !key || (isArray(key) && !key.length)) {
    return 0;
  }
  const get = isKey<T>(key)
    ? (value: T) => value[key]
    : (value: T) => key.reduce((acc, k) => acc + +(value[k] ?? 0), 0);
  return values.reduce((acc, item) => acc + +(get(item) ?? 0), 0);
}

export const sumOperator = () => map<number[], number>(sum);
export const sumByOperator = <T>(key: keyof T | (keyof T)[]) => map<T[], number>(values => sumBy(values, key));

@Pipe({ name: 'stSumBy' })
export class SumByPipe implements PipeTransform {
  transform<T = any>(value: T[], key: keyof T | (keyof T)[]): number {
    return sumBy(value, key);
  }
}

@Pipe({ name: 'stSum' })
export class SumPipe implements PipeTransform {
  transform(value: number[]): number {
    return sum(value);
  }
}
