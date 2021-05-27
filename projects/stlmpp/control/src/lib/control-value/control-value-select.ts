import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef,
  HostListener,
  Input,
  QueryList,
  Renderer2,
} from '@angular/core';
import { ControlValue } from './control-value';
import { isNil } from 'st-utils';
import { ControlValueSelectOption } from './control-value-select-option';
import { AbstractControlValue } from './abstract-control-value';

@Directive({
  selector: 'select:not([multiple])[control],select:not([multiple])[controlName],select:not([multiple])[model]',
  providers: [{ provide: ControlValue, useExisting: ControlValueSelect, multi: true }],
})
export class ControlValueSelect extends AbstractControlValue<any, HTMLSelectElement> implements AfterContentInit {
  constructor(renderer2: Renderer2, elementRef: ElementRef<HTMLSelectElement>) {
    super(renderer2, elementRef);
  }

  private _valueAfterContentInit: any;
  private _setValueAfterContentInit = false;

  @ContentChildren(ControlValueSelectOption, { descendants: true }) options!: QueryList<ControlValueSelectOption>;

  @Input() compareWith: (valueA: any, valueB: any) => boolean = Object.is;

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

  @HostListener('change', ['$event'])
  onChange($event: Event): void {
    const index = ($event.target as HTMLSelectElement).selectedIndex;
    this.onChange$.next(this.options.toArray()[index].value);
  }

  setValue(value: any): void {
    if (!this.options && value) {
      this._valueAfterContentInit = value;
      this._setValueAfterContentInit = true;
    } else {
      this._setValue(value);
    }
  }

  focus(): void {
    this.elementRef.nativeElement.focus();
  }

  ngAfterContentInit(): void {
    if (this._setValueAfterContentInit) {
      this.setValue(this._valueAfterContentInit);
      this._setValueAfterContentInit = false;
    }
  }
}
