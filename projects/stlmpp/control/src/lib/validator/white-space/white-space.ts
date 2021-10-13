import { ControlValidator } from '../validator';
import { Observable } from 'rxjs';
import { Control } from '../../control/control';

export class AbstractWhiteSpaceValidator extends ControlValidator<string | null | undefined, boolean> {
  readonly name: string = 'whiteSpace';
  validate({ value }: Control<string | null | undefined>): Observable<boolean | null> | boolean | null {
    if (!value) {
      return null;
    }
    return value.trim() === '' || null;
  }
}

export class WhiteSpaceValidator extends AbstractWhiteSpaceValidator {}
