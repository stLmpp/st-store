import { Control } from '../../control/control';
import { ControlValidator, ControlValidatorAttributes } from '../validator';
import { LengthValidationError } from './max-length';
import { Directive, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Nullable } from '../../util';

@Directive()
export abstract class AbstractMinLengthValidator<T extends Nullable<string | any[]> = any>
  extends ControlValidator<T, LengthValidationError>
  implements OnChanges
{
  @HostBinding('attr.minlength')
  get minlengthAttr(): number {
    return this._minLength;
  }

  @Input()
  set minLength(minLength: number) {
    this._minLength = minLength;
    this.attrs = { minLength };
  }
  private _minLength!: number;

  readonly name = 'minLength';

  override attrs: ControlValidatorAttributes = {};

  validate({ value }: Control<T>): LengthValidationError | null {
    if (!value) {
      return null;
    }
    const length = value.length;
    return length < this._minLength ? { actual: length, required: this._minLength } : null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const minLengthChange = changes.minLength;
    if (minLengthChange && !minLengthChange.isFirstChange()) {
      this.validationChange$.next();
    }
  }
}

export class MinLengthValidator<T extends Nullable<string | any[]> = any> extends AbstractMinLengthValidator<T> {
  constructor(minLength: number) {
    super();
    this.minLength = minLength;
  }
}
