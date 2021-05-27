import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { ControlValue } from './control-value';
import { AbstractControlValue } from './abstract-control-value';

@Directive({
  selector: `input[type=number][control],input[type=number][controlName],input[type=number][model],
    input[type=range][control],input[type=range][controlName],input[type=range][model]`,
  providers: [{ provide: ControlValue, useExisting: ControlValueNumber }],
})
export class ControlValueNumber extends AbstractControlValue<number | null, HTMLInputElement> {
  constructor(renderer2: Renderer2, elementRef: ElementRef<HTMLInputElement>) {
    super(renderer2, elementRef);
  }

  @HostListener('input', ['$event'])
  onInput($event: InputEvent): void {
    const value = ($event.target as HTMLInputElement).value;
    this.onChange$.next(value ? +value : null);
  }

  focus(): void {
    this.elementRef.nativeElement.focus();
  }
}
