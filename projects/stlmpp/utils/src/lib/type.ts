export type ID = string | number;
export type IdGetter<T, S = number> = (entity: T) => S;
export type IdGetterType<T, S extends ID = number> = IdGetter<T, S> | string | string[] | keyof T;
