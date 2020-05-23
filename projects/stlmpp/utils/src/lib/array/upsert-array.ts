import { updateArray } from './update-array';
import { addArray } from './add-array';
import { DeepPartial } from '../deep-partial';
import { IdGetter } from '../type';

export function upsertArray<T>(
  array: T[],
  newItem: T | Partial<T> | DeepPartial<T>,
  idGetter: IdGetter<T> = entity => (entity as any).id
): T[] {
  if (array.some(item => idGetter(item) === idGetter(newItem as any))) {
    return updateArray(array, idGetter(newItem as any), newItem);
  } else if (idGetter(newItem as any)) {
    return addArray(array, newItem as T);
  }
}
