import { Directive, Host, Input, OnInit, Optional, SkipSelf } from '@angular/core';
import { ControlParent } from '../control-parent';
import { ControlGroupDirective } from './control-group.directive';
import { ControlNameDoesNotMatch, ControlNameNotFound, ControlParentNotFound } from '../error';
import { ControlChild } from '../control-child';
import { AbstractControlDirective } from '../abstract-control';
import { isControlGroup } from './control-group';

@Directive({
  selector: '[controlGroupName]',
  exportAs: 'controlGroupName',
  providers: [
    { provide: ControlParent, useExisting: ControlGroupNameDirective },
    { provide: ControlChild, useExisting: ControlGroupNameDirective },
    { provide: ControlGroupDirective, useExisting: ControlGroupNameDirective },
    { provide: AbstractControlDirective, useExisting: ControlGroupNameDirective },
  ],
})
export class ControlGroupNameDirective<T = any, M = any> extends ControlGroupDirective<T, M> implements OnInit {
  constructor(@Host() @Optional() @SkipSelf() private controlParent?: ControlParent) {
    super();
  }

  private _controlGroupName!: string | number;
  private _initialized = false;

  @Input()
  set controlGroupName(controlGroupName: string | number) {
    this._controlGroupName = controlGroupName;
    this.init();
  }

  init(): void {
    if (!this._initialized) {
      return;
    }
    if (!this.controlParent) {
      throw new ControlParentNotFound('controlGroupName', this._controlGroupName);
    }
    const control = this.controlParent.get(this._controlGroupName);
    if (!control) {
      throw new ControlNameNotFound('controlGroupName', this._controlGroupName);
    }
    if (!isControlGroup(control)) {
      throw new ControlNameDoesNotMatch('controlGroupName', this._controlGroupName);
    }
    this.control = control;
    this.initAllChilds();
  }

  ngOnInit(): void {
    this._initialized = true;
    this.init();
  }
}
