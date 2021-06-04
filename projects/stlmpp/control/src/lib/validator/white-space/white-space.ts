import { ControlValidator } from '../validator';
import { isNil } from 'st-utils';
import { Observable } from 'rxjs';
import { Control } from '../../control/control';
import { Nullable } from '../../util';

export class AbstractWhiteSpaceValidator extends ControlValidator<Nullable<string>, boolean> {
  readonly name = 'whiteSpace';
  validate({ value }: Control<Nullable<string>>): Observable<boolean | null> | boolean | null {
    if (isNil(value)) {
      return null;
    }
    return value.trim() === '' || null;
  }
}

export class WhiteSpaceValidator extends AbstractWhiteSpaceValidator {}
