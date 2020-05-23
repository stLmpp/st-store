import { merge } from 'merge-anything';
import { DeepPartial } from './deep-partial';

export function deepMerge<T>(
  entity: T,
  ...partials: Array<DeepPartial<T> | Partial<T>>
): T {
  return merge(entity as any, ...(partials as any));
}
