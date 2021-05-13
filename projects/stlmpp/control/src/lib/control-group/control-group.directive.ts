import { Directive, HostBinding, Input } from '@angular/core';
import { ControlParent } from '../control-parent';
import { ControlGroup } from './control-group';
import { Control } from '../control/control';
import { ControlArray } from '../control-array/control-array';
import { AbstractControlDirective } from '../abstract-control';

@Directive({
  selector: '[controlGroup]',
  exportAs: 'controlGroup',
  providers: [
    { provide: ControlParent, useExisting: ControlGroupDirective },
    { provide: AbstractControlDirective, useExisting: ControlGroupDirective },
  ],
})
export class ControlGroupDirective<T extends Record<any, any> = Record<any, any>> extends ControlParent {
  @Input('controlGroup') control!: ControlGroup<T>;

  @HostBinding('class.is-submitted')
  get submitted(): boolean {
    return this.control.submitted;
  }

  get<K extends keyof T>(name: K): Control<T[K]> | ControlGroup<T[K]> | ControlArray | undefined {
    return this.control.get(name);
  }
}
