import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef,
  forwardRef,
  HostListener,
  Input,
  QueryList,
  Renderer2,
} from '@angular/core';
import { ControlValue } from './control-value';
import { isNil } from '@stlmpp/utils';
import { ControlValueSelectOption } from './control-value-select-option';
import { AbstractControlValue } from './abstract-control-value';

@Directive({
  selector: 'select:not([multiple])[control],select:not([multiple])[controlName]',
  providers: [{ provide: ControlValue, useExisting: forwardRef(() => ControlValueSelect), multi: true }],
})
export class ControlValueSelect extends AbstractControlValue implements AfterContentInit {
  constructor(renderer2: Renderer2, elementRef: ElementRef<HTMLSelectElement>) {
    super(renderer2, elementRef);
  }

  @ContentChildren(ControlValueSelectOption, { descendants: true }) options!: QueryList<ControlValueSelectOption>;

  @Input() compareWith: (valueA: any, valueB: any) => boolean = Object.is;

  private _valueAfterContentInit: any;
  private _setValueAfterContentInit = false;

  @HostListener('change', ['$event'])
  onChange($event: Event): void {
    const index = ($event.target as HTMLSelectElement).selectedIndex;
    this.onChange$.next(this.options.toArray()[index].value);
  }

  private _setValue(value: any): void {
    if (isNil(value)) {
      this.renderer2.setProperty(this.elementRef.nativeElement, 'selectedIndex', -1);
    }
    const option = this.options?.find(element => this.compareWith(element.value, value));
    if (option) {
      const newValue = option.elementRef.nativeElement.value;
      this.renderer2.setProperty(this.elementRef.nativeElement, 'value', '' + newValue);
    } else {
      this.renderer2.setProperty(this.elementRef.nativeElement, 'selectedIndex', -1);
    }
  }

  setValue(value: any | null | undefined): void {
    if (!this.options && value) {
      this._valueAfterContentInit = value;
      this._setValueAfterContentInit = true;
    } else {
      this._setValue(value);
    }
  }

  ngAfterContentInit(): void {
    if (this._setValueAfterContentInit) {
      this.setValue(this._valueAfterContentInit);
      this._setValueAfterContentInit = false;
    }
  }
}
