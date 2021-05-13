import { isNil } from 'st-utils';

export function isEmptyValue(value: any): value is null | undefined | '' {
  return isNil(value) || value === '';
}

let uniqueId = 1;

export function getUniqueId(): number {
  return uniqueId++;
}

export type Entries<T = any, K extends keyof T = keyof T> = [K, T[K]][];
export type Nullable<T> = T | null | undefined;
