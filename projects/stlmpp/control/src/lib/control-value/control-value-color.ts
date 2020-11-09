import { AfterViewInit, Directive, ElementRef, forwardRef, Renderer2 } from '@angular/core';
import { ControlValue } from './control-value';
import { ControlValueText } from './control-value-text';

@Directive({
  selector: 'input[type=color][control],input[type=color][controlName]',
  providers: [{ provide: ControlValue, useExisting: forwardRef(() => ControlValueColor), multi: true }],
})
export class ControlValueColor extends ControlValueText implements AfterViewInit {
  constructor(renderer2: Renderer2, elementRef: ElementRef<HTMLInputElement>) {
    super(renderer2, elementRef);
  }

  ngAfterViewInit(): void {
    if (this.elementRef.nativeElement.value) {
      setTimeout(() => {
        this.onChange$.next(this.elementRef.nativeElement.value);
      });
    }
  }
}
