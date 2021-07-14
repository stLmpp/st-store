import { Directive, Host, Input, OnDestroy, OnInit, Optional, SkipSelf } from '@angular/core';
import { ControlParent } from '../control-parent';
import { ControlGroup } from '../control-group/control-group';
import { ControlNameDoesNotMatch, ControlNameNotFound, ControlParentNotFound } from '../error';
import { ControlArray, isControlArray } from './control-array';
import { ControlChild } from '../control-child';
import { Control } from '../control/control';
import { ControlType } from '../control/control-type';
import { AbstractControlDirective } from '../abstract-control';

@Directive({
  selector: '[controlArrayName]',
  exportAs: 'controlArrayName',
  providers: [
    { provide: ControlParent, useExisting: ControlArrayNameDirective },
    { provide: ControlChild, useExisting: ControlArrayNameDirective },
    { provide: AbstractControlDirective, useExisting: ControlArrayNameDirective },
  ],
})
export class ControlArrayNameDirective<T = any, M = any>
  extends ControlParent
  implements OnInit, OnDestroy, Iterable<ControlType<T>>
{
  constructor(@Optional() @Host() @SkipSelf() private controlParent?: ControlParent) {
    super();
  }

  private _controlArrayName!: string | number;
  private _initialized = false;

  protected override control!: ControlArray<T, M>;

  @Input()
  set controlArrayName(controlArrayName: string) {
    this._controlArrayName = controlArrayName;
    this.init();
  }

  init(): void {
    if (!this._initialized) {
      return;
    }
    if (!this.controlParent) {
      throw new ControlParentNotFound('controlArrayName', this._controlArrayName);
    }
    const control = this.controlParent.get(this._controlArrayName);
    if (!control) {
      throw new ControlNameNotFound('controlArrayName', this._controlArrayName);
    }
    if (!isControlArray(control)) {
      throw new ControlNameDoesNotMatch('controlArrayName', this._controlArrayName);
    }
    this.control = control;
    this.initAllChildren();
  }

  *[Symbol.iterator](): Iterator<ControlType<T>> {
    for (const control of this.control) {
      yield control;
    }
  }

  get(index: number): Control | ControlGroup | ControlArray | undefined {
    return this.control.get(index);
  }

  ngOnInit(): void {
    this._initialized = true;
    this.init();
  }

  override ngOnDestroy(): void {
    if (isControlArray(this.control)) {
      this.control.destroy();
    }
    super.ngOnDestroy();
  }
}
