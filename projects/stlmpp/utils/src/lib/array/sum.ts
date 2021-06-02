import { Pipe, PipeTransform } from '@angular/core';
import { map } from 'rxjs/operators';
import { OperatorFunction } from 'rxjs';
import { sum, sumBy } from 'st-utils';
import { ConditionalKeys } from 'type-fest';

export const sumOperator = (): OperatorFunction<number[], number> => map<number[], number>(sum);
export const sumByOperator = <T extends Record<any, any>, K extends ConditionalKeys<T, number | null | undefined>>(
  key: K
): OperatorFunction<T[], number> => map<T[], number>(values => sumBy<T, K>(values, key));

@Pipe({ name: 'sumBy' })
export class SumByPipe implements PipeTransform {
  transform<T extends Record<any, any>, K extends ConditionalKeys<T, number | null | undefined>>(
    value: T[],
    key: K
  ): number {
    return sumBy<T, K>(value, key);
  }
}

@Pipe({ name: 'sum' })
export class SumPipe implements PipeTransform {
  transform(value: number[]): number {
    return sum(value);
  }
}
