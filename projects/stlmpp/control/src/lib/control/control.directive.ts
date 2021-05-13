import {
  ChangeDetectorRef,
  Directive,
  ElementRef,
  Inject,
  Input,
  IterableDiffer,
  IterableDiffers,
  KeyValueDiffer,
  KeyValueDiffers,
  OnChanges,
  OnDestroy,
  Optional,
  Renderer2,
  Self,
  SimpleChanges,
} from '@angular/core';
import { AbstractControlDirective } from '../abstract-control';
import { ControlValue } from '../control-value/control-value';
import { ControlValueNotFound } from '../error';
import { coerceArray, isNil } from 'st-utils';
import { Subject } from 'rxjs';
import { Control } from './control';
import { auditTime, filter, takeUntil } from 'rxjs/operators';
import { isEmptyValue } from '../util';

@Directive()
export abstract class BaseControlDirective<T = any> extends AbstractControlDirective implements OnDestroy, OnChanges {
  constructor(
    private elementRef: ElementRef,
    private renderer2: Renderer2,
    private changeDetectorRef: ChangeDetectorRef,
    private keyValueDiffers: KeyValueDiffers,
    private iterableDiffers: IterableDiffers,
    @Self() @Optional() @Inject(ControlValue) controlValues?: ControlValue<T> | ControlValue<T>[]
  ) {
    super();
    if (!controlValues) {
      throw new ControlValueNotFound();
    }
    this._controlValues = coerceArray(controlValues);
  }

  private _attrDiffer!: KeyValueDiffer<string, string>;
  private _classesDiffer!: IterableDiffer<string>;
  private readonly _controlValues: ControlValue<T>[];
  protected readonly _destroy$ = new Subject<void>();

  control!: Control<T>;

  protected init(): void {
    this._destroy$.next();
    this._attrDiffer = this.keyValueDiffers.find({}).create();
    this._classesDiffer = this.iterableDiffers.find([]).create();
    for (const controlValue of this._controlValues) {
      controlValue.setValue(this.control.value);
    }
    let valueStored = this.control.value;
    let lastValueSetByControlValue = false;
    for (const controlValue of this._controlValues) {
      controlValue.onChange$.pipe(takeUntil(this._destroy$)).subscribe(value => {
        if (this.control.updateOn === 'change') {
          if (!isEmptyValue(value)) {
            this.control.markAsDirty();
          }
          this.control.markAsTouched();
          this.control.setValue(value, { emitInternalValue$: false });
        } else {
          valueStored = value;
          lastValueSetByControlValue = true;
        }
      });
      controlValue.onTouched$.pipe(takeUntil(this._destroy$)).subscribe(() => {
        this.control.markAsTouched();
        if (this.control.updateOn === 'blur') {
          if (!isEmptyValue(valueStored)) {
            this.control.markAsDirty();
          }
          this.control.setValue(valueStored, { emitInternalValue$: false });
        }
      });
    }
    this.control.submit$
      .pipe(
        takeUntil(this._destroy$),
        filter(() => this.control.updateOn === 'submit')
      )
      .subscribe(() => {
        if (!isEmptyValue(valueStored)) {
          this.control.markAsDirty();
        }
        this.control.setValue(valueStored, { emitInternalValue$: !lastValueSetByControlValue });
      });
    this.control.internalValueChanges$.pipe(takeUntil(this._destroy$)).subscribe(value => {
      for (const controlValue of this._controlValues) {
        controlValue.setValue(value);
      }
      valueStored = value;
      lastValueSetByControlValue = false;
    });
    this.control.disabledChanged$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      for (const controlValue of this._controlValues) {
        controlValue.setDisabled?.(this.control.disabled);
      }
    });
    this.control.stateChanged$.pipe(takeUntil(this._destroy$), auditTime(0)).subscribe(state => {
      for (const controlValue of this._controlValues) {
        controlValue.stateChanged?.(state);
      }
      this.changeDetectorRef.markForCheck();
    });
    this.control.attributesChanged$.pipe(takeUntil(this._destroy$)).subscribe(attrs => {
      const differs = this._attrDiffer.diff(attrs);
      if (differs) {
        differs.forEachAddedItem(change => {
          this.renderer2.setAttribute(this.elementRef.nativeElement, change.key, change.currentValue ?? '');
        });
        differs.forEachRemovedItem(change => {
          this.renderer2.removeAttribute(this.elementRef.nativeElement, change.key);
        });
        differs.forEachChangedItem(change => {
          this.renderer2.setAttribute(this.elementRef.nativeElement, change.key, change.currentValue ?? '');
        });
      }
    });
    this.control.classesChanged$.pipe(takeUntil(this._destroy$)).subscribe(classes => {
      const differs = this._classesDiffer.diff(classes);
      if (differs) {
        differs.forEachAddedItem(change => {
          this.renderer2.addClass(this.elementRef.nativeElement, change.item);
        });
        differs.forEachRemovedItem(change => {
          this.renderer2.removeClass(this.elementRef.nativeElement, change.item);
        });
      }
    });
    this.control.init();
    if (!isNil(this._disabled) && this.control.disabled !== this._disabled) {
      this.control.disable(this._disabled);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.control?.currentValue) {
      this.init();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}

@Directive({ selector: '[control]', providers: [{ provide: AbstractControlDirective, useExisting: ControlDirective }] })
export class ControlDirective<T = any> extends BaseControlDirective<T> {
  @Input() control!: Control<T>;
}
