import { ControlValidator } from '../validator';
import { Observable } from 'rxjs';
import { Control } from '../../control/control';
import { Nullable } from '../../util';

export class AbstractWhiteSpaceValidator extends ControlValidator<Nullable<string>, boolean> {
  readonly name = 'whiteSpace';
  validate({ value }: Control<Nullable<string>>): Observable<boolean | null> | boolean | null {
    if (!value) {
      return null;
    }
    return value.trim() === '' || null;
  }
}

export class WhiteSpaceValidator extends AbstractWhiteSpaceValidator {}
