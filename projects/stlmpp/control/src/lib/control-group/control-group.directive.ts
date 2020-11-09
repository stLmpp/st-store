import { Directive, forwardRef, HostBinding, Input } from '@angular/core';
import { ControlParent } from '../control-parent';
import { Control } from '../control';
import { ControlArray } from '../control-array';
import { ControlGroup } from './control-group';

@Directive({
  selector: '[controlGroup]',
  exportAs: 'controlGroup',
  providers: [{ provide: ControlParent, useExisting: forwardRef(() => ControlGroupDirective) }],
})
export class ControlGroupDirective<T = any> extends ControlParent {
  @Input('controlGroup') control!: ControlGroup<T>;

  @HostBinding('class.is-submitted')
  get submitted(): boolean {
    return this.control.submitted;
  }

  get(name: keyof T): Control | ControlGroup | ControlArray | undefined {
    return this.control.get(name);
  }
}
