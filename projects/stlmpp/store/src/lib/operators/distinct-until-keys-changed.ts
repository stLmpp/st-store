import { OperatorFunction } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

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
