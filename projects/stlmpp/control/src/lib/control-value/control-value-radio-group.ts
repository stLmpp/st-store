import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef,
  Input,
  OnDestroy,
  QueryList,
  Renderer2,
} from '@angular/core';
import { ControlValue } from './control-value';
import { isNotNil } from 'st-utils';
import { startWith, Subject, takeUntil } from 'rxjs';
import { ControlValueRadioParent } from './control-value-radio-parent';
import { ControlValueRadio } from './control-value-radio';

let uniqueID = 0;

@Directive({
  selector: `radio-group[control],[radioGroup][control],
    radio-group[controlName],[radioGroup][controlName],
    radio-group[model],[radioGroup][model]`,
  providers: [
    { provide: ControlValue, useExisting: ControlValueRadioGroup, multi: true },
    { provide: ControlValueRadioParent, useExisting: ControlValueRadioGroup },
  ],
})
export class ControlValueRadioGroup extends ControlValueRadioParent implements AfterContentInit, OnDestroy {
  constructor(private elementRef: ElementRef, private renderer2: Renderer2) {
    super();
  }

  private readonly _destroy$ = new Subject<void>();
  private readonly _children = new QueryList<ControlValueRadio>();
  private _markForDisabledAfterContentInit = false;
  private _markForValueAfterContentInit = false;
  private _lastValue: any;

  @ContentChildren(ControlValueRadio, { descendants: true }) readonly allChildren!: QueryList<ControlValueRadio>;

  @Input() compareWith: (valueA: any, valueB: any) => boolean = Object.is;

  override readonly id = uniqueID++;

  private _disableChildren(disabled: boolean): void {
    for (const child of this._children) {
      this.renderer2.setProperty(child.elementRef.nativeElement, 'disabled', disabled);
    }
  }

  private _setValue(value: any): void {
    for (const radio of this._children) {
      const checked = this.compareWith(value, radio.value);
      this.renderer2.setProperty(radio.elementRef.nativeElement, 'checked', checked);
      this.renderer2.setAttribute(radio.elementRef.nativeElement, 'aria-checked', '' + checked);
    }
  }

  onChange(value: any): void {
    this.onChange$.next(value);
    this._lastValue = value;
  }

  override setDisabled(disabled: boolean): void {
    if (!this.allChildren && disabled) {
      this._markForDisabledAfterContentInit = true;
    } else {
      this._disableChildren(disabled);
      this._markForDisabledAfterContentInit = false;
    }
  }

  setValue(value: any): void {
    if (!this.allChildren && isNotNil(value)) {
      this._markForValueAfterContentInit = true;
      this._lastValue = value;
    } else {
      this._setValue(value);
      this._markForValueAfterContentInit = false;
      this._lastValue = value;
    }
  }

  override focus(): void {
    this._children.first?.elementRef?.nativeElement?.focus();
  }

  ngAfterContentInit(): void {
    this.allChildren.changes
      .pipe(takeUntil(this._destroy$), startWith(this.allChildren))
      .subscribe((children: QueryList<ControlValueRadio>) => {
        this._children.reset(children.filter(child => child.controlValueRadioParent === this));
        this._setValue(this._lastValue);
        this._children.notifyOnChanges();
      });
    if (this._markForDisabledAfterContentInit) {
      this._disableChildren(true);
      this._markForDisabledAfterContentInit = false;
    }
    if (this._markForValueAfterContentInit) {
      this._setValue(this._lastValue);
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
