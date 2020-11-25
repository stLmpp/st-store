import { Directive, ElementRef, forwardRef, HostBinding, HostListener, Input, Renderer2 } from '@angular/core';
import { ControlValue } from './control-value';
import { AbstractControlValue } from './abstract-control-value';

@Directive({
  selector: 'input[type=radio][control],input[type=radio][controlName],input[type=radio][model]',
  providers: [{ provide: ControlValue, useExisting: forwardRef(() => ControlValueRadioStandalone), multi: true }],
})
export class ControlValueRadioStandalone extends AbstractControlValue {
  constructor(renderer2: Renderer2, elementRef: ElementRef<HTMLInputElement>) {
    super(renderer2, elementRef);
  }

  @Input() @HostBinding('attr.name') name!: string;
  @Input() value: any;

  @Input() compareWith: (valueA: any, valueB: any) => boolean = Object.is;

  @HostListener('change', ['$event'])
  onChange($event: Event): void {
    if (($event.target as HTMLInputElement).checked) {
      this.onChange$.next(this.value);
    }
  }

  setValue(value: any | null | undefined): void {
    const checked = this.compareWith(value, this.value);
    this.renderer2.setProperty(this.elementRef.nativeElement, 'checked', checked);
    this.renderer2.setAttribute(this.elementRef.nativeElement, 'aria-checked', '' + checked);
  }
}
