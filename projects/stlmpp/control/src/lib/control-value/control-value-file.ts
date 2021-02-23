import { Directive, forwardRef, HostListener } from '@angular/core';
import { ControlValue } from './control-value';
import { isNil } from 'st-utils';
import { AbstractControlValue } from './abstract-control-value';

@Directive({
  selector: 'input[type=file][control],input[type=file][controlName],input[type=file][model]',
  providers: [{ provide: ControlValue, useExisting: forwardRef(() => ControlValueFile), multi: true }],
})
export class ControlValueFile extends AbstractControlValue<FileList | null> {
  @HostListener('change', ['$event'])
  onChange($event: Event): void {
    const target = $event.target as HTMLInputElement;
    this.onChange$.next(target.files);
  }

  setValue(value: FileList | null): void {
    if (isNil(value)) {
      this.renderer2.setProperty(this.elementRef.nativeElement, 'value', '');
    }
  }
}
