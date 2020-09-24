import { Pipe, PipeTransform } from '@angular/core';
import { map } from 'rxjs/operators';
import { getDeep } from './get-deep';
import { isArray, isString } from 'lodash-es';

export function sum(values: number[]): number {
  if (!values?.length) return 0;
  return values.reduce((acc, item) => acc + +(item ?? 0), 0);
}

export function sumBy<T = any>(values: T[], key: keyof T | (keyof T)[] | string | string[]): number {
  const keyIsArray = isArray(key);
  if (!values?.length || !key || (keyIsArray && !(key as any[])?.length)) return 0;
  const get = keyIsArray || (isString(key) && key.includes('.')) ? getDeep : value => value[key];
  return values.reduce((acc, item) => acc + +(get(item, key as string) ?? 0), 0);
}

export const sumOperator = () => map<number[], number>(sum);
export const sumByOperator = <T>(key: keyof T | (keyof T)[]) =>
  map<T[], number>(values => sumBy(values, key));

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
