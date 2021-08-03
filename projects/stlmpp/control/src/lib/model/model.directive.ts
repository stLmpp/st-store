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
import { takeUntil } from 'rxjs';
import { AbstractControlDirective, AbstractControlOptions } from '../abstract-control';
import { ControlValue } from '../control-value/control-value';
import { ControlValidator } from '../validator/validator';
import { coerceArray } from 'st-utils';
import { ControlUpdateOn } from '../control-update-on';

export type ModelOptions = Omit<AbstractControlOptions, 'disabled'>;

@Directive({
  selector: '[model]:not([control]):not([controlName])',
  exportAs: 'model',
  providers: [{ provide: AbstractControlDirective, useExisting: ModelDirective }],
})
export class ModelDirective<T = any, M = any> extends BaseControlDirective<T, M> implements OnInit {
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
  private _modelUpdateOn: ControlUpdateOn = 'change';
  private _modelMetadata?: M;

  @Input()
  set model(value: T) {
    this.control?.setValue(value, { emitChange: false });
    this._model = value;
  }
  private _model!: T;

  @Output() readonly modelChange = new EventEmitter<T>();

  @Input()
  set modelUpdateOn(updateOn: ControlUpdateOn) {
    this.control?.setUpdateOn(updateOn);
    this._modelUpdateOn = updateOn;
  }

  @Input()
  set modelMetadata(metadata: M) {
    if (this.control) {
      this.control.metadata = metadata;
    }
    this._modelMetadata = metadata;
  }

  ngOnInit(): void {
    this.control = new Control<T>(this._model, {
      updateOn: this._modelUpdateOn,
      validators: this._controlValidators,
      metadata: this._modelMetadata,
    });
    this.init();
    this.control.valueChanges$.pipe(takeUntil(this._destroy$)).subscribe(value => {
      this.modelChange.next(value);
      this._model = value;
    });
  }
}
