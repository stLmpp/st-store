import { Directive, forwardRef, HostBinding, Input } from '@angular/core';
import { ControlParent } from '../control-parent';
import { ControlGroup } from './control-group';
import { Control } from '../control/control';
import { ControlArray } from '../control-array/control-array';

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
