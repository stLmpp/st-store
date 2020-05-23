export type ID = string | number;
export type IdGetter<T, S = number> = (entity: T) => S;
