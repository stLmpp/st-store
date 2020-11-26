import { AfterViewInit, Directive, ElementRef, forwardRef, Renderer2 } from '@angular/core';
import { ControlValue } from './control-value';
import { ControlValueDefault } from './control-value-default';

@Directive({
  selector: 'input[type=color][control],input[type=color][controlName],input[type=color][model]',
  providers: [{ provide: ControlValue, useExisting: forwardRef(() => ControlValueColor), multi: true }],
})
export class ControlValueColor extends ControlValueDefault implements AfterViewInit {
  // eslint-disable-next-line @typescript-eslint/no-useless-constructor
  constructor(renderer2: Renderer2, elementRef: ElementRef<HTMLInputElement>) {
    super(renderer2, elementRef);
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.onChange$.next(this.elementRef.nativeElement.value);
    });
  }
}
