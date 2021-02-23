import { map } from 'rxjs/operators';
import { MonoTypeOperatorFunction } from 'rxjs';
import { Pipe, PipeTransform } from '@angular/core';
import { orderBy, OrderByDirection, OrderByType } from 'st-utils';

export function orderByOperator<T>(
  keyOrCommand?: OrderByType<T>,
  order: OrderByDirection = 'asc'
): MonoTypeOperatorFunction<T[]> {
  return map(array => orderBy(array, keyOrCommand, order));
}

@Pipe({ name: 'stOrderBy' })
export class OrderByPipe implements PipeTransform {
  transform<T = any, K extends keyof T = keyof T>(
    value: T[],
    keyOrCommand?: OrderByType<T>,
    order: OrderByDirection = 'asc'
  ): T[] {
    return orderBy(value, keyOrCommand, order);
  }
}
