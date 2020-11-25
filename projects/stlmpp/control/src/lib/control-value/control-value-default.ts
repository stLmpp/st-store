import { Directive, ElementRef, forwardRef, HostListener, Renderer2 } from '@angular/core';
import { ControlValue } from './control-value';
import { AbstractControlValue } from './abstract-control-value';

@Directive({
  selector: `input[control]:not([type=checkbox]):not([type=color]):not([type=date]):not([type=week]):not([type=time]):not([type=month]):not([type=date]):not([type=datetime-local]):not([type=file]):not([type=number]):not([type=radio]),
    input[controlName]:not([type=checkbox]):not([type=color]):not([type=date]):not([type=week]):not([type=time]):not([type=month]):not([type=date]):not([type=datetime-local]):not([type=file]):not([type=number]):not([type=radio]),
    input[model]:not([type=checkbox]):not([type=color]):not([type=date]):not([type=week]):not([type=time]):not([type=month]):not([type=date]):not([type=datetime-local]):not([type=file]):not([type=number]):not([type=radio]),
    textarea[control],textarea[controlName],textarea[model]`,
  providers: [{ provide: ControlValue, useExisting: forwardRef(() => ControlValueDefault), multi: true }],
})
export class ControlValueDefault extends AbstractControlValue<string> {
  constructor(renderer2: Renderer2, elementRef: ElementRef) {
    super(renderer2, elementRef);
  }

  @HostListener('input', ['$event'])
  onInput($event: InputEvent): void {
    const value = ($event.target as HTMLInputElement).value;
    this.onChange$.next(value);
  }
}
