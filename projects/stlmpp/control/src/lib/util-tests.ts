/* istanbul ignore file */

import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { DebugElement } from '@angular/core';
import { isUndefined } from 'st-utils';
import { Control } from './control/control';
import { ControlValidator } from './validator/validator';

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

export class AsyncValidator extends ControlValidator {
  constructor(private result: any = true, private throwError = false) {
    super();
  }

  name = 'asyncValidator';
  override async = true;
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
