/* istanbul ignore file */

import { ControlValidator } from './validator';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { DebugElement } from '@angular/core';
import { isUndefined } from '@stlmpp/utils';
import { Control } from './control';

export function wait(ms = 10): Promise<void> {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}

export function triggerEvent(input: DebugElement, event: string, value?: any, prop = 'value'): void {
  if (!isUndefined(value)) {
    input.nativeElement[prop] = value;
  }
  input.triggerEventHandler(event, { target: input.nativeElement });
}

export class AsyncValidator implements ControlValidator {
  constructor(private result: any = true, private throwError = false) {}

  name = 'asyncValidator';
  async = true;
  validate(): Observable<any> | Observable<null> | null {
    return of(null).pipe(
      delay(5),
      map(() => {
        if (this.throwError) {
          throw new Error();
        }
        return null;
      }),
      delay(5),
      map(() => this.result)
    );
  }
}

export function createFakeControl<T>(value: T): Control<T> {
  return { value } as Control<T>;
}
