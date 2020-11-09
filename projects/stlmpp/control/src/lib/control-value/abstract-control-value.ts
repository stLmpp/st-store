import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { ControlValue } from './control-value';

@Directive()
export abstract class AbstractControlValue<T = any> extends ControlValue<T> {
  protected constructor(protected renderer2: Renderer2, protected elementRef: ElementRef) {
    super();
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched$.next();
  }

  setValue(value: T | null | undefined): void {
    this.renderer2.setProperty(this.elementRef.nativeElement, 'value', value ?? '');
  }

  setDisabled(disabled: boolean): void {
    this.renderer2.setProperty(this.elementRef.nativeElement, 'disabled', disabled);
  }
}
