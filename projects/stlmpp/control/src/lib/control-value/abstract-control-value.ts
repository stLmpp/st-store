import { Directive, ElementRef, HostListener, Renderer2 } from '@angular/core';
import { ControlValue } from './control-value';

@Directive()
export abstract class AbstractControlValue<T = any, E = Element> extends ControlValue<T> {
  constructor(protected renderer2: Renderer2, protected elementRef: ElementRef<E>) {
    super();
  }

  @HostListener('blur')
  onBlur(): void {
    this.onTouched$.next();
  }

  setValue(value: T): void {
    this.renderer2.setProperty(this.elementRef.nativeElement, 'value', value ?? '');
  }

  override setDisabled(disabled: boolean): void {
    this.renderer2.setProperty(this.elementRef.nativeElement, 'disabled', disabled);
  }
}
