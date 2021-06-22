import { isNil } from 'st-utils';
import { Observable } from 'rxjs';

/**
 * @template T
 * @description Strategy used to persist the value in the localStorage
 */
export class StorePersistLocalStorageStrategy<T> implements StorePersistStrategy<T> {
  /**
   * @description get the value from localStorage
   * @param {string} key
   * @returns {string | null | undefined}
   */
  get(key: string): string | null | undefined {
    return localStorage.getItem(key);
  }

  /**
   * @description set the value in the localStorage
   * @param {string} key
   * @param {string | undefined} value
   */
  set(key: string, value: string | undefined): void {
    if (isNil(value)) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, value);
    }
  }

  /**
   * @description get the value from the store
   * @param {T} state
   * @param {keyof T} key
   */
  getStore(state: T, key: keyof T): any {
    return state[key];
  }

  /**
   * @description serialize the value using {@link JSON#stringify}
   * @param value
   * @returns {string | undefined}
   */
  serialize(value: any): string | undefined {
    return value ? JSON.stringify(value) : undefined;
  }

  /**
   * @description deserialize the value using {@link JSON#parse}
   * @param {string | undefined} value
   */
  deserialize(value: string | undefined): any {
    return value ? JSON.parse(value) : undefined;
  }

  /**
   * @description set the value persisted in the store
   * @param {T} state
   * @param value
   * @param {keyof T} key
   * @returns {T}
   */
  setStore(state: T, value: any, key: keyof T): T {
    return { ...state, [key]: value };
  }
}

/**
 * @template T
 * @description used to persist the value of the store
 */
export interface StorePersistStrategy<T> {
  /**
   * @description get the value from the persisted location
   * @param {string} key
   * @returns {string | Observable<string | null | undefined> | Promise<string | null | undefined> | null | undefined}
   */
  get(
    key: string
  ): string | null | undefined | Observable<string | null | undefined> | Promise<string | null | undefined>;

  /**
   * @description persist the value
   * @param {string} key
   * @param {string | undefined} value
   * @returns {void | Promise<void> | Observable<void>}
   */
  set(key: string, value: string | undefined): void | Promise<void> | Observable<void>;

  /**
   * @description serialize the value to persist
   * @param value
   * @returns {string | undefined}
   */
  serialize(value: any): string | undefined;

  /**
   * @description deserialize the value persisted to set in the store
   * @param {string | undefined} value
   */
  deserialize(value: string | undefined): any;

  /**
   * @description get the value to be persisted from store
   * @param {T} state
   * @param {keyof T} key
   */
  getStore(state: T, key?: keyof T): any;

  /**
   * @description set the value persisted in the store
   * @param {T} state
   * @param value
   * @param {keyof T} key
   * @returns {T}
   */
  setStore(state: T, value: any, key?: keyof T): T;
}
