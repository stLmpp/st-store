import { ControlValidator } from './validator';
import { Control } from '../control/control';
import { combineLatest, isObservable, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { coerceArray, isNil } from '@stlmpp/utils';

function toObservable(value: any): Observable<any> {
  return isObservable(value) ? value : of(value);
}

export class ComposeAsyncValidator implements ControlValidator<any, Record<string, any>> {
  constructor(validators: ControlValidator[]) {
    this.validators = validators.filter(validator => validator.async);
    for (const validator of validators) {
      if (validator.attrs) {
        this.attrs = { ...this.attrs, ...validator.attrs };
      }
      if (validator.classes) {
        this.classes.push(...coerceArray(validator.classes));
      }
    }
  }
  private readonly validators: ControlValidator[];
  async = true;
  attrs: Record<string, string | number | boolean | undefined> = {};
  classes: string[] = [];
  name = 'composeAsync';

  validate(control: Control): Observable<Record<string, any> | null> {
    const errors$: Observable<any>[] = this.validators.map(validator =>
      toObservable(validator.validate(control)).pipe(map(error => (isNil(error) ? null : { [validator.name]: error })))
    );
    return combineLatest(errors$).pipe(
      map(errors => {
        if (!errors.length || errors.every(isNil)) {
          return null;
        }
        return errors.reduce((acc, error) => {
          return { ...acc, ...error };
        }, {});
      })
    );
  }
}
