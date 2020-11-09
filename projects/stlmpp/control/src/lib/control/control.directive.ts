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
import { ControlValue } from '../control-value';
import { ControlValueNotFound } from '../error';
import { Subject } from 'rxjs';
import { auditTime, filter, takeUntil } from 'rxjs/operators';
import { isEmptyValue } from '../util';
import { Control } from './control';
import { coerceArray } from '@angular/cdk/coercion';
import { AbstractControlDirective } from '../abstract-control';
import { isNil } from '@stlmpp/utils';

@Directive({ selector: '[control]' })
export class ControlDirective<T = any> extends AbstractControlDirective implements OnDestroy, OnChanges {
  constructor(
    private elementRef: ElementRef,
    private renderer2: Renderer2,
    private changeDetectorRef: ChangeDetectorRef,
    private keyValueDiffers: KeyValueDiffers,
    private iterableDiffers: IterableDiffers,
    @Self() @Optional() @Inject(ControlValue) controlValues?: ControlValue | ControlValue[]
  ) {
    super();
    if (!controlValues) {
      throw new ControlValueNotFound();
    }
    this.controlValues = coerceArray(controlValues);
  }

  private attrDiffer!: KeyValueDiffer<string, string>;
  private classesDiffer!: IterableDiffer<string>;

  private readonly controlValues: ControlValue[];

  private _destroy$ = new Subject();

  @Input() control!: Control<T>;

  protected init(): void {
    this._destroy$.next();
    this.attrDiffer = this.keyValueDiffers.find({}).create();
    this.classesDiffer = this.iterableDiffers.find([]).create();
    let valueStored: T | null | undefined;
    for (const controlValue of this.controlValues) {
      controlValue.onChange$.pipe(takeUntil(this._destroy$)).subscribe(value => {
        if (this.control.updateOn === 'change') {
          if (!isEmptyValue(value)) {
            this.control.markAsDirty();
          }
          this.control.markAsTouched();
          this.control.setValue(value);
        } else {
          valueStored = value;
        }
      });
      controlValue.onTouched$.pipe(takeUntil(this._destroy$)).subscribe(() => {
        this.control.markAsTouched();
        if (this.control.updateOn === 'blur') {
          if (!isEmptyValue(valueStored)) {
            this.control.markAsDirty();
          }
          this.control.setValue(valueStored);
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
        this.control.setValue(valueStored);
      });
    this.control.value$.pipe(takeUntil(this._destroy$)).subscribe(value => {
      for (const controlValue of this.controlValues) {
        controlValue.setValue(value);
      }
      valueStored = value;
      this.control.runValidators();
    });
    this.control.disabledChanged$.pipe(takeUntil(this._destroy$)).subscribe(() => {
      for (const controlValue of this.controlValues) {
        controlValue.setDisabled?.(this.control.disabled);
      }
    });
    this.control.stateChanged$.pipe(takeUntil(this._destroy$), auditTime(0)).subscribe(state => {
      for (const controlValue of this.controlValues) {
        controlValue.stateChanged?.(state);
      }
      this.changeDetectorRef.markForCheck();
    });
    this.control.attributesChanged$.pipe(takeUntil(this._destroy$)).subscribe(attrs => {
      const differs = this.attrDiffer.diff(attrs);
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
      const differs = this.classesDiffer.diff(classes);
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
