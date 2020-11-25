import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  forwardRef,
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
import { Control } from './control';
import { ControlChild } from '../control-child';

@Directive({
  selector: '[controlName]',
  exportAs: 'controlName',
  providers: [
    { provide: ControlChild, useExisting: forwardRef(() => ControlNameDirective) },
    { provide: ControlDirective, useExisting: forwardRef(() => ControlNameDirective) },
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

  @Input()
  set controlName(controlName: string | number) {
    this._controlName = controlName;
    this.init();
  }
  private _controlName!: string | number;

  init(): void {
    if (this._initialized) {
      if (!this.controlParent) {
        throw new ControlParentNotFound('controlName', this._controlName);
      }
      this.control = this.controlParent.get(this._controlName) as Control;
      if (!this.control) {
        throw new ControlNameNotFound('controlName', this._controlName);
      }
      if (!(this.control instanceof Control)) {
        throw new ControlNameDoesNotMatch('controlName', this._controlName);
      }
      super.init();
    }
  }

  ngOnInit(): void {
    this._initialized = true;
    this.init();
  }
}
