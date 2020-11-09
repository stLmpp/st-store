import { Params } from '@angular/router';
import { isNil } from '@stlmpp/utils';

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
