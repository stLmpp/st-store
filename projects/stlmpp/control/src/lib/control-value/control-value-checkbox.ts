import { Directive, ElementRef, forwardRef, HostListener, Input, Renderer2 } from '@angular/core';
import { ControlValue } from './control-value';
import { AbstractControlValue } from './abstract-control-value';

@Directive({
  selector: 'input[type=checkbox][control],input[type=checkbox][controlName],input[type=checkbox][model]',
  providers: [{ provide: ControlValue, useExisting: forwardRef(() => ControlValueCheckbox), multi: true }],
})
export class ControlValueCheckbox extends AbstractControlValue<boolean> {
  constructor(renderer2: Renderer2, elementRef: ElementRef<HTMLInputElement>) {
    super(renderer2, elementRef);
  }

  @Input()
  set indeterminate(indeterminate: boolean) {
    this.renderer2.setProperty(this.elementRef.nativeElement, 'indeterminate', indeterminate);
    if (indeterminate) {
      this.onChange$.next(false);
    }
  }

  @HostListener('change', ['$event'])
  onChange($event: Event): void {
    this.onChange$.next(($event.target as HTMLInputElement).checked);
  }

  setValue(value: boolean): void {
    this.renderer2.setProperty(this.elementRef.nativeElement, 'checked', value);
    this.renderer2.setAttribute(this.elementRef.nativeElement, 'aria-checked', '' + value);
  }
}
