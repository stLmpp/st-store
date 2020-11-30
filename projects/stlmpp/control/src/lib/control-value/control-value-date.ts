import { Directive, ElementRef, forwardRef, HostListener, Input, Renderer2 } from '@angular/core';
import { ControlValue } from './control-value';
import { isDate } from '@stlmpp/utils';
import { format, isValid, parse, parseISO } from 'date-fns';
import { AbstractControlValue } from './abstract-control-value';

const MAX_YEAR = 199999;

function between(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

const WEEK_FORMAT_REG = /^\d+-W([0-4]\d|5[0-4])$/;

const transformer: Record<
  ControlValueDateInputType,
  { toValue(value: any, dateFormat?: string): any; toControl(value: any): any }
> = {
  date: {
    toControl(value: string): Date | null {
      if (!value) {
        return null;
      }
      return parseISO(value);
    },
    toValue(value: string | Date | null, dateFormat = 'yyyy-MM-dd'): string {
      if (!value) {
        return '';
      }
      if (isDate(value)) {
        return format(value, dateFormat);
      } else {
        const date = parseISO(value);
        if (!isValid(date)) {
          return '';
        } else {
          return format(date, dateFormat);
        }
      }
    },
  },
  month: {
    toControl(value: string): Date | null {
      return transformer.date.toControl(value);
    },
    toValue(value: Date | string | null): string {
      return transformer.date.toValue(value, 'yyyy-MM');
    },
  },
  time: {
    toControl(value: string): string {
      return value;
    },
    toValue(value: string): string {
      if (!value) {
        return value;
      }
      const [hour, minute] = value.split(':');
      if (!between(Number(hour), 0, 23) || !between(Number(minute), 0, 59)) {
        return '';
      }
      return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`;
    },
  },
  week: {
    toControl(value: string): string {
      return value;
    },
    toValue(value: string): string {
      if (!value) {
        return value;
      }
      if (!WEEK_FORMAT_REG.test(value)) {
        return '';
      }
      const [year] = value.split('-');
      if (!between(Number(year), 0, MAX_YEAR)) {
        return '';
      }
      return value;
    },
  },
  ['datetime-local']: {
    toControl(value: string): Date | null {
      if (!value) {
        return null;
      }
      const parsedDate = parse(value, `yyyy-MM-dd'T'HH:mm`, 0);
      // Apparently the browser already handles this validation setting the input to '', but I'll leave it here just in case
      if (!isValid(parsedDate)) {
        return null;
      }
      return parsedDate;
    },
    toValue(value: Date | string | null): string {
      return transformer.date.toValue(value, `yyyy-MM-dd'T'HH:mm`);
    },
  },
};

export type ControlValueDateInputType = 'week' | 'time' | 'month' | 'date' | 'datetime-local';

@Directive({
  selector: `input[type=datetime-local][control],input[type=datetime-local][controlName],input[type=datetime-local][model],
    input[type=date][control],input[type=date][controlName],input[type=date][model],
    input[type=week][control],input[type=week][controlName],input[type=week][model],
    input[type=time][control],input[type=time][controlName],input[type=time][model],
    input[type=month][control],input[type=month][controlName],input[type=month][model]`,
  providers: [{ provide: ControlValue, useExisting: forwardRef(() => ControlValueDate), multi: true }],
})
export class ControlValueDate extends AbstractControlValue<string | Date | null> {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(renderer2: Renderer2, elementRef: ElementRef<HTMLInputElement>) {
    super(renderer2, elementRef);
  }

  @Input() type!: ControlValueDateInputType;

  @HostListener('input', ['$event'])
  onChange($event: InputEvent): void {
    const value = ($event.target as HTMLInputElement).value;
    const toControl = transformer[this.type].toControl;
    this.onChange$.next(toControl(value));
  }

  setValue(value: string | Date | null): void {
    const toValue = transformer[this.type].toValue;
    value = toValue(value);
    super.setValue(value);
  }
}
