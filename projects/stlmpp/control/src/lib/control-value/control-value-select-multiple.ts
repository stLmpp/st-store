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
import { ControlValueSelectOption } from './control-value-select-option';
import { AbstractControlValue } from './abstract-control-value';

@Directive({
  selector: 'select[multiple][control],select[multiple][controlName],select[multiple][model]',
  providers: [{ provide: ControlValue, useExisting: forwardRef(() => ControlValueSelectMultiple), multi: true }],
})
export class ControlValueSelectMultiple extends AbstractControlValue<any[]> implements AfterContentInit {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(renderer2: Renderer2, elementRef: ElementRef<HTMLSelectElement>) {
    super(renderer2, elementRef);
  }

  private _indices = new Set<number>();
  private _valueAfterContentInit: any;
  private _setValueAfterContentInit = false;

  @ContentChildren(ControlValueSelectOption, { descendants: true }) options!: QueryList<ControlValueSelectOption>;

  @Input() compareWith: (valueA: any, valueB: any) => boolean = Object.is;

  private _setValue(values: any[]): void {
    if (!values.length) {
      this.renderer2.setProperty(this.elementRef.nativeElement, 'selectedIndex', -1);
    } else {
      const indicesDelete = new Set([...this._indices]);
      this._indices.clear();
      const optionsArray = this.options.toArray();
      for (const value of values) {
        const index = optionsArray.findIndex(option => this.compareWith(option.value, value));
        if (index > -1) {
          this._indices.add(index);
          indicesDelete.delete(index);
          const option = optionsArray[index];
          if (option) {
            this.renderer2.setProperty(option.elementRef.nativeElement, 'selected', true);
          }
        }
      }
      for (const index of indicesDelete) {
        this.renderer2.setProperty(optionsArray[index].elementRef.nativeElement, 'selected', false);
      }
    }
  }

  @HostListener('change', ['$event'])
  onChange($event: Event): void {
    const target = $event.target as HTMLSelectElement;
    const selectOptions: ControlValueSelectOption[] = [];
    for (let index = 0, len = target.selectedOptions.length; index < len; index++) {
      const element = target.selectedOptions.item(index);
      if (element) {
        const option = this.options.find(({ elementRef: { nativeElement } }) => nativeElement === element);
        if (option) {
          selectOptions.push(option.value);
        }
      }
    }
    this.onChange$.next(selectOptions);
  }

  setValue(value: any[]): void {
    if (!this.options && value?.length) {
      this._valueAfterContentInit = value;
      this._setValueAfterContentInit = true;
    } else {
      this._setValue(value ?? []);
    }
  }

  ngAfterContentInit(): void {
    if (this._setValueAfterContentInit) {
      this.setValue(this._valueAfterContentInit);
      this._setValueAfterContentInit = false;
    }
  }
}
