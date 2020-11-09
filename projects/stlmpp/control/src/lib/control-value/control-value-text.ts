import { Directive, ElementRef, forwardRef, HostListener, Renderer2 } from '@angular/core';
import { ControlValue } from './control-value';
import { AbstractControlValue } from './abstract-control-value';

@Directive({
  selector:
    'input:not([type])[control],input:not([type])[controlName],input[type=email][control],input[type=email][controlName],input[type=tel][control],input[type=tel][controlName],input[type=hidden][control],input[type=hidden][controlName],input[type=text][control],input[type=text][controlName],input[type=search][control],input[type=search][controlName],input[type=password][control],input[type=password][controlName],input[type=url][control],input[type=url][controlName],textarea[control],textarea[controlName]',
  providers: [{ provide: ControlValue, useExisting: forwardRef(() => ControlValueText), multi: true }],
})
export class ControlValueText extends AbstractControlValue<string> {
  constructor(renderer2: Renderer2, elementRef: ElementRef) {
    super(renderer2, elementRef);
  }

  @HostListener('input', ['$event'])
  onInput($event: InputEvent): void {
    const value = ($event.target as HTMLInputElement).value;
    this.onChange$.next(value);
  }
}
