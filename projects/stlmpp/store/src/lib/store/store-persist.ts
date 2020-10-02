import { isNil } from 'lodash-es';

export class StorePersistLocalStorageStrategy<T> implements StorePersistStrategy<T> {
  get(key: string): string | null | undefined {
    return localStorage.getItem(key);
  }
  set(key: string, value: string | undefined): void {
    if (isNil(value)) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  }
  getStore(state: T, key: keyof T): any {
    return state[key];
  }
  serialize(value: any): string | undefined {
    return value ? JSON.stringify(value) : undefined;
  }
  deserialize(value: string | undefined): any {
    return value ? JSON.parse(value) : undefined;
  }
  setStore(state: T, value: any, key: keyof T): T {
    return { ...state, [key]: value };
  }
}

export interface StorePersistStrategy<T> {
  get(key: string): string | null | undefined;
  set(key: string, value: string | undefined): void;
  serialize(value: any): string | undefined;
  deserialize(value: string | undefined): any;
  getStore(state: T, key?: keyof T): any;
  setStore(state: T, value: any, key?: keyof T): T;
}
