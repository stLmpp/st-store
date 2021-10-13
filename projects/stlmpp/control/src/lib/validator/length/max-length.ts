import { Control } from '../../control/control';
import { ControlValidator, ControlValidatorAttributes } from '../validator';
import { Directive, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';

export interface LengthValidationError {
  required: number;
  actual: number;
}

@Directive()
export abstract class AbstractMaxLengthValidator<T extends string | any[] | null | undefined = any>
  extends ControlValidator<T, LengthValidationError>
  implements OnChanges
{
  @HostBinding('attr.maxlength')
  get maxlengthAttr(): number {
    return this._maxLength;
  }

  @Input()
  set maxLength(maxLength: number) {
    this._maxLength = maxLength;
    this.attrs = { maxLength };
  }
  private _maxLength!: number;

  readonly name: string = 'maxLength';

  override attrs: ControlValidatorAttributes = {};

  validate({ value }: Control<T>): LengthValidationError | null {
    if (!value) {
      return null;
    }
    const length = value.length;
    return length > this._maxLength ? { actual: length, required: this._maxLength } : null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const maxLengthChange = changes.maxLength;
    if (maxLengthChange && !maxLengthChange.isFirstChange()) {
      this.validationChange$.next();
    }
  }
}

export class MaxLengthValidator<
  T extends string | any[] | null | undefined = any
> extends AbstractMaxLengthValidator<T> {
  constructor(maxLength: number) {
    super();
    this.maxLength = maxLength;
  }
}
