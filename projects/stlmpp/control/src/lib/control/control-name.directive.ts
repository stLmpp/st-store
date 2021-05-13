import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Host,
  Inject,
  Input,
  IterableDiffers,
  KeyValueDiffers,
  OnInit,
  Optional,
  Renderer2,
  Self,
} from '@angular/core';
import { ControlDirective } from './control.directive';
import { ControlValue } from '../control-value/control-value';
import { ControlParent } from '../control-parent';
import { ControlNameDoesNotMatch, ControlNameNotFound, ControlParentNotFound } from '../error';
import { ControlChild } from '../control-child';
import { AbstractControlDirective } from '../abstract-control';
import { isControl } from '../util';

@Directive({
  selector: '[controlName]',
  exportAs: 'controlName',
  providers: [
    { provide: ControlChild, useExisting: ControlNameDirective },
    { provide: ControlDirective, useExisting: ControlNameDirective },
    { provide: AbstractControlDirective, useExisting: ControlNameDirective },
  ],
})
export class ControlNameDirective<T = any> extends ControlDirective<T> implements OnInit {
  constructor(
    elementRef: ElementRef,
    renderer2: Renderer2,
    changeDetectorRef: ChangeDetectorRef,
    keyValueDiffers: KeyValueDiffers,
    iterableDiffers: IterableDiffers,
    @Self() @Optional() @Inject(ControlValue) controlValues?: ControlValue | ControlValue[],
    @Host() @Optional() private controlParent?: ControlParent
  ) {
    super(elementRef, renderer2, changeDetectorRef, keyValueDiffers, iterableDiffers, controlValues);
  }

  private _initialized = false;
  private _controlName!: string | number;

  @Input()
  set controlName(controlName: string | number) {
    this._controlName = controlName;
    this.init();
  }

  init(): void {
    if (!this._initialized) {
      return;
    }
    if (!this.controlParent) {
      throw new ControlParentNotFound('controlName', this._controlName);
    }
    const control = this.controlParent.get(this._controlName);
    if (!control) {
      throw new ControlNameNotFound('controlName', this._controlName);
    }
    if (!isControl(control)) {
      throw new ControlNameDoesNotMatch('controlName', this._controlName);
    }
    this.control = control;
    super.init();
  }

  ngOnInit(): void {
    this._initialized = true;
    this.init();
  }
}
