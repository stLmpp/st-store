import { Params } from '@angular/router';
import { isNil } from 'st-utils';

/**
 * @description Compare two sets of params and returns if they are equal (somewhat like a shallow object equality)
 * @param {Params} paramsA
 * @param {Params} paramsB
 * @returns {boolean}
 */
export function isEqualParams(paramsA: Params, paramsB: Params): boolean {
  if (isNil(paramsA) || isNil(paramsB)) {
    return false;
  }
  const keysA = Object.keys(paramsA);
  const keysB = Object.keys(paramsB);
  if (keysA.length !== keysB.length) {
    return false;
  }
  let index = keysA.length;
  while (index--) {
    const key = keysA[index];
    if (paramsA[key] !== paramsB[key]) {
      return false;
    }
  }
  return true;
}
