import { ControlValidator, ControlValidatorAttributes } from '../validator';
import { Control } from '../../control/control';
import { isDate, isNil, isString } from 'st-utils';
import { format, isAfter, parseISO } from 'date-fns';
import { Directive, HostBinding, Input, OnChanges, SimpleChanges } from '@angular/core';

export type MaxMinType = 'date' | 'number';

export interface MaxMinValidationError<T extends Date | number | null | undefined> {
  actual: T;
  required: NonNullable<T>;
}

export function getTypeAndValue(maxMin: string | Date | number): [MaxMinType, Date | number, string] {
  if (isString(maxMin)) {
    return ['date', parseISO(maxMin), maxMin];
  } else {
    const isDateMaxMin = isDate(maxMin);
    return [isDateMaxMin ? 'date' : 'number', maxMin, isDateMaxMin ? format(maxMin, 'yyyy-MM-dd') : '' + maxMin];
  }
}

@Directive()
export abstract class AbstractMaxValidator<T extends Date | number | null | undefined>
  extends ControlValidator<T, MaxMinValidationError<T>>
  implements OnChanges
{
  @HostBinding('attr.max')
  get maxAttr(): string {
    return '' + this.attrs.max;
  }

  @Input()
  set max(max: NonNullable<T> | string) {
    const [type, newMax, attr] = getTypeAndValue(max);
    this._type = type;
    this._max = newMax as any;
    this.attrs = { max: attr };
  }
  private _max!: NonNullable<T>;
  private _type!: MaxMinType;

  override attrs: ControlValidatorAttributes = {};

  readonly name: string = 'max';

  validate({ value }: Control<T>): MaxMinValidationError<T> | null {
    if (isNil(value)) {
      return null;
    }
    switch (this._type) {
      case 'number': {
        return value > this._max ? { actual: value, required: this._max } : null;
      }
      case 'date': {
        const newValue = isString(value) ? parseISO(value) : (value as Date);
        return isAfter(newValue, this._max) ? ({ actual: newValue, required: this._max } as any) : null;
      }
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    const maxChange = changes.max;
    if (maxChange && !maxChange.isFirstChange()) {
      this.validationChange$.next();
    }
  }
}

export class MaxValidator<T extends Date | number | null | undefined> extends AbstractMaxValidator<T> {
  constructor(max: string | NonNullable<T>) {
    super();
    this.max = max;
  }
}
