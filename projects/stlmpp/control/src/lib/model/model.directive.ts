import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  IterableDiffers,
  KeyValueDiffers,
  OnInit,
  Optional,
  Output,
  Renderer2,
  Self,
} from '@angular/core';
import { BaseControlDirective } from '../control/control.directive';
import { Control } from '../control/control';
import { takeUntil } from 'rxjs/operators';
import { AbstractControlOptions } from '../abstract-control';
import { ControlValue } from '../control-value/control-value';
import { ControlValidator } from '../validator/validator';
import { coerceArray } from '@stlmpp/utils';
import { ControlUpdateOn } from '../control-update-on';

export type ModelOptions = Omit<AbstractControlOptions, 'disabled'>;

@Directive({ selector: '[model]:not([control]):not([controlName])', exportAs: 'model' })
export class ModelDirective<T = any> extends BaseControlDirective<T> implements OnInit {
  constructor(
    elementRef: ElementRef,
    renderer2: Renderer2,
    changeDetectorRef: ChangeDetectorRef,
    keyValueDiffers: KeyValueDiffers,
    iterableDiffers: IterableDiffers,
    @Self() @Optional() @Inject(ControlValue) controlValues?: ControlValue<T> | ControlValue<T>[],
    @Self() @Optional() @Inject(ControlValidator) controlValidators?: ControlValidator<T> | ControlValidator<T>[]
  ) {
    super(elementRef, renderer2, changeDetectorRef, keyValueDiffers, iterableDiffers, controlValues);
    if (controlValidators) {
      this._controlValidators = coerceArray(controlValidators);
    }
  }

  private readonly _controlValidators: ControlValidator<T>[] = [];
  private _updateOn: ControlUpdateOn = 'change';

  @Input()
  set model(value: T | null | undefined) {
    this.control?.setValue(value, { emitChange: false });
    this._model = value;
  }
  private _model: T | null | undefined;

  @Output() modelChange = new EventEmitter<T | null | undefined>();

  @Input()
  set updateOn(updateOn: ControlUpdateOn) {
    this.control?.setUpdateOn(updateOn);
    this._updateOn = updateOn;
  }

  ngOnInit(): void {
    this.control = new Control<T>(this._model, { updateOn: this._updateOn, validators: this._controlValidators });
    this.init();
    this.control.valueChanges$.pipe(takeUntil(this._destroy$)).subscribe(value => {
      this.modelChange.next(value);
      this._model = value;
    });
  }
}