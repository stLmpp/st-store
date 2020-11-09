import { Directive, ElementRef, Input } from '@angular/core';

@Directive({ selector: 'option' })
export class ControlValueSelectOption {
  constructor(public elementRef: ElementRef<HTMLOptionElement>) {}

  @Input() value!: any;
}
