import { Directive, forwardRef, Host, Input, OnInit, Optional, SkipSelf } from '@angular/core';
import { ControlParent } from '../control-parent';
import { ControlGroupDirective } from './control-group.directive';
import { ControlNameDoesNotMatch, ControlNameNotFound, ControlParentNotFound } from '../error';
import { ControlGroup } from './control-group';
import { ControlChild } from '../control-child';

@Directive({
  selector: '[controlGroupName]',
  exportAs: 'controlGroupName',
  providers: [
    { provide: ControlParent, useExisting: forwardRef(() => ControlGroupNameDirective) },
    { provide: ControlChild, useExisting: forwardRef(() => ControlGroupNameDirective) },
    { provide: ControlGroupDirective, useExisting: forwardRef(() => ControlGroupNameDirective) },
  ],
})
export class ControlGroupNameDirective<T = any> extends ControlGroupDirective<T> implements OnInit {
  constructor(@Host() @Optional() @SkipSelf() private controlParent?: ControlParent) {
    super();
  }

  @Input()
  set controlGroupName(controlGroupName: string | number) {
    this._controlGroupName = controlGroupName;
    this.init();
  }
  private _controlGroupName!: string | number;

  private _initialized = false;

  private init(): void {
    if (this._initialized) {
      if (!this.controlParent) {
        throw new ControlParentNotFound('controlGroupName', this._controlGroupName);
      }
      this.control = this.controlParent.get(this._controlGroupName) as ControlGroup;
      if (!this.control) {
        throw new ControlNameNotFound('controlGroupName', this._controlGroupName);
      }
      if (!(this.control instanceof ControlGroup)) {
        throw new ControlNameDoesNotMatch('controlGroupName', this._controlGroupName);
      }
      this.initAllChilds();
    }
  }

  ngOnInit(): void {
    this._initialized = true;
    this.init();
  }
}
