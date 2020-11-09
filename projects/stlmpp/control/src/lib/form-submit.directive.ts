import { Directive, EventEmitter, HostBinding, HostListener, Output, Self } from '@angular/core';
import { ControlGroup } from './control-group';
import { ControlGroupDirective } from './control-group';

@Directive({ selector: 'form[controlGroup]:not([nativeValidate])' })
export class FormSubmitDirective<T = any> {
  constructor(@Self() private controlGroupDirective: ControlGroupDirective) {}

  @Output() groupSubmit = new EventEmitter<ControlGroup<T>>();
  @Output() groupReset = new EventEmitter<ControlGroup<T>>();

  @HostBinding('attr.novalidate') novalidate = '';

  @HostListener('submit', ['$event'])
  onSubmit($event: Event): void {
    $event.preventDefault();
    this.controlGroupDirective.control.submit();
    this.groupSubmit.emit(this.controlGroupDirective.control);
  }

  @HostListener('reset', ['$event'])
  onReset($event: Event): void {
    $event.preventDefault();
    this.controlGroupDirective.control.reset();
    this.groupReset.emit(this.controlGroupDirective.control);
  }
}
