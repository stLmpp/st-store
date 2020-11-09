import { Directive, forwardRef, Host, Input, OnDestroy, OnInit, Optional, SkipSelf } from '@angular/core';
import { ControlParent } from '../control-parent';
import { Control, ControlType } from '../control';
import { ControlGroup } from '../control-group';
import { ControlNameDoesNotMatch, ControlNameNotFound, ControlParentNotFound } from '../error';
import { ControlArray } from './control-array';
import { ControlChild } from '../control-child';

@Directive({
  selector: '[controlArrayName]',
  exportAs: 'controlArrayName',
  providers: [
    { provide: ControlParent, useExisting: forwardRef(() => ControlArrayNameDirective) },
    { provide: ControlChild, useExisting: forwardRef(() => ControlArrayNameDirective) },
  ],
})
export class ControlArrayNameDirective<T = any>
  extends ControlParent
  implements OnInit, OnDestroy, Iterable<ControlType<T>> {
  constructor(@Optional() @Host() @SkipSelf() private controlParent?: ControlParent) {
    super();
  }

  protected control!: ControlArray<T>;

  @Input()
  set controlArrayName(controlArrayName: string) {
    this._controlArrayName = controlArrayName;
    this.init();
  }
  private _controlArrayName!: string | number;

  private _initialized = false;

  *[Symbol.iterator](): Iterator<ControlType<T>> {
    for (const control of this.control) {
      yield control;
    }
  }

  private init(): void {
    if (this._initialized) {
      if (!this.controlParent) {
        throw new ControlParentNotFound('controlArrayName', this._controlArrayName);
      }
      this.control = this.controlParent.get(this._controlArrayName) as ControlArray;
      if (!this.control) {
        throw new ControlNameNotFound('controlArrayName', this._controlArrayName);
      }
      if (!(this.control instanceof ControlArray)) {
        throw new ControlNameDoesNotMatch('controlArrayName', this._controlArrayName);
      }
      this.initAllChilds();
    }
  }

  get(index: number): Control | ControlGroup | ControlArray | undefined {
    return this.control.get(index);
  }

  ngOnInit(): void {
    this._initialized = true;
    this.init();
  }

  ngOnDestroy(): void {
    if (this.control instanceof ControlArray) {
      this.control.destroy();
    }
    super.ngOnDestroy();
  }
}
