import { Directive, ElementRef, forwardRef, HostListener, Renderer2 } from '@angular/core';
import { ControlValue } from './control-value';
import { isNil } from '@stlmpp/utils';
import { AbstractControlValue } from './abstract-control-value';

@Directive({
  selector: 'input[type=file][control],input[type=file][controlName]',
  providers: [{ provide: ControlValue, useExisting: forwardRef(() => ControlValueFile), multi: true }],
})
export class ControlValueFile extends AbstractControlValue<FileList> {
  constructor(renderer2: Renderer2, elementRef: ElementRef<HTMLInputElement>) {
    super(renderer2, elementRef);
  }

  @HostListener('change', ['$event'])
  onChange($event: Event): void {
    const target = $event.target as HTMLInputElement;
    this.onChange$.next(target.files);
  }

  setValue(value: FileList | null | undefined): void {
    if (isNil(value)) {
      this.renderer2.setProperty(this.elementRef.nativeElement, 'value', '');
    }
  }
}
