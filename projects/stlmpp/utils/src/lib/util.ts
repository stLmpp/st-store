import { ID, IdGetter, IdGetterType } from './type';

export function isID(value: any): value is ID {
  return isString(value) || isNumber(value);
}

export function idGetterFactory<T, S extends ID = number>(property: keyof T): IdGetter<T, S>;
export function idGetterFactory<T, S extends ID = number>(nested: string): IdGetter<T, S>;
export function idGetterFactory<T, S extends ID = number>(nested: string[]): IdGetter<T, S>;
export function idGetterFactory<T, S extends ID = number>(fn: IdGetter<T, S>): IdGetter<T, S>;
export function idGetterFactory<T, S extends ID = number>(): IdGetter<T, S>;
export function idGetterFactory<T, S extends ID = number>(arg?: IdGetterType<T, S>): IdGetter<T, S>;
export function idGetterFactory<T, S extends ID = number>(arg?: IdGetterType<T, S>): IdGetter<T, S> {
  if (!arg) {
    return entity => (entity as any).id;
  } else if (isFunction(arg)) {
    return arg;
  } else if (isString(arg)) {
    if (arg.includes('.')) {
      return entity => getDeep(entity, arg);
    } else {
      return entity => (entity as any)[arg];
    }
  } else if (isArray(arg)) {
    return entity => getDeep(entity, arg as string[]);
  } else {
    return entity => (entity as any).id;
  }
}

export function isObjectEmpty(value: Record<any, any>): boolean {
  return !Object.keys(value).length;
}

export function isString(value: any): value is string {
  return typeof value === 'string';
}

export function isNumber(value: any): value is number {
  return typeof value === 'number';
}

export function isArray(value: any): value is any[] {
  return Array.isArray(value);
}

export function isFunction(value: any): value is (...args: any[]) => any {
  return typeof value === 'function';
}

export function isObject(value: any): value is Record<any, any> {
  return !isNull(value) && typeof value === 'object';
}

export function isUndefined(value: any): value is undefined {
  return typeof value === 'undefined';
}

export function isNull(value: any): value is null {
  return value === null;
}

export function isNil(value: any): value is null | undefined {
  return value == null;
}

export function isDate(value: any): value is Date {
  return Object.prototype.toString.call(value) === '[object Date]';
}

export function isRegExp(value: any): value is RegExp {
  return Object.prototype.toString.call(value) === '[object RegExp]';
}

export function uniq<T = any>(value: T[]): T[] {
  return [...new Set(value)];
}

export function uniqBy<T = any>(value: T[], key: keyof T): T[] {
  return [
    ...value
      .reduce((map, item) => {
        if (!map.has(item[key])) {
          map.set(item[key], item);
        }
        return map;
      }, new Map())
      .values(),
  ];
}

export function getDeep<T = any, K extends keyof T = keyof T, R = T[K]>(value: T, key: K): R;
export function getDeep<T = any, R = any>(obj: T, path: string, defaultValue?: any): R;
export function getDeep<T = any, R = any>(obj: T, path: string[], defaultValue?: any): R;
export function getDeep<T = any, R = any>(obj: T, path: string | string[], defaultValue?: any): R;
export function getDeep<T = any, R = any>(obj: T, path: string | string[], defaultValue?: any): R {
  if (isString(path) && !path.includes('.')) {
    return (obj as any)[path] ?? defaultValue;
  }
  if (!isArray(path)) path = path.split('.');
  if (path.length === 1) {
    return (obj as any)[path[0]] ?? defaultValue;
  }
  return path.reduce((acc, key) => (acc as any)?.[key], obj) ?? defaultValue;
}

export function coerceArray<T>(arrayOrValue: T | T[]): T[] {
  return isArray(arrayOrValue) ? arrayOrValue : [arrayOrValue];
}
