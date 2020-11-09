import { isNil } from '@stlmpp/utils';

export function isEmptyValue(value: any): value is null | undefined | '' {
  return isNil(value) || value === '';
}

export type Entries<T = any, K extends keyof T = keyof T> = [K, T[K]][];
