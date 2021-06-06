import { OperatorFunction } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

/**
 * @description distinct until keys changed, check every key specified in the args, to see if they changed
 * @param {K[]} keys
 * @returns {OperatorFunction<T, T>}
 */
export function distinctUntilKeysChanged<T extends Record<string, any>, K extends keyof T>(
  keys: K[]
): OperatorFunction<T, T> {
  return distinctUntilChanged((valueA, valueB) => {
    let index = keys.length;
    while (index--) {
      const key = keys[index];
      if (valueA[key] !== valueB[key]) {
        return false;
      }
    }
    return true;
  });
}
