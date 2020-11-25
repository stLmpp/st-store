import {
  AfterContentInit,
  ContentChildren,
  Directive,
  ElementRef,
  forwardRef,
  Input,
  OnDestroy,
  QueryList,
  Renderer2,
} from '@angular/core';
import { ControlValue } from './control-value';
import { isNil } from '@stlmpp/utils';
import { Subject } from 'rxjs';
import { startWith, takeUntil } from 'rxjs/operators';
import { ControlValueRadioParent } from './control-value-radio-parent';
import { ControlValueRadio } from './control-value-radio';

let uniqueID = 0;

@Directive({
  selector: `radio-group[control],[radioGroup][control],
    radio-group[controlName],[radioGroup][controlName],
    radio-group[model],[radioGroup][model]`,
  providers: [
    { provide: ControlValue, useExisting: forwardRef(() => ControlValueRadioGroup), multi: true },
    { provide: ControlValueRadioParent, useExisting: forwardRef(() => ControlValueRadioGroup) },
  ],
})
export class ControlValueRadioGroup extends ControlValueRadioParent implements AfterContentInit, OnDestroy {
  constructor(private elementRef: ElementRef, private renderer2: Renderer2) {
    super();
  }

  private _destroy$ = new Subject();

  id = uniqueID++;

  private _markForDisabledAfterContentInit = false;
  private _markForValueAfterContentInit = false;
  private _lastValue: any;

  @ContentChildren(ControlValueRadio, { descendants: true }) _children!: QueryList<ControlValueRadio>;

  children = new QueryList<ControlValueRadio>();

  @Input() compareWith: (valueA: any, valueB: any) => boolean = Object.is;

  private _disableChildren(disabled: boolean): void {
    for (const child of this.children) {
      this.renderer2.setProperty(child.elementRef.nativeElement, 'disabled', disabled);
    }
  }

  onChange(value: any): void {
    this.onChange$.next(value);
    this._lastValue = value;
  }

  setDisabled(disabled: boolean): void {
    if (!this._children && disabled) {
      this._markForDisabledAfterContentInit = true;
    } else {
      this._disableChildren(disabled);
      this._markForDisabledAfterContentInit = false;
    }
  }

  private _setValue(value: any | null | undefined): void {
    for (const radio of this.children) {
      const checked = this.compareWith(value, radio.value);
      this.renderer2.setProperty(radio.elementRef.nativeElement, 'checked', checked);
      this.renderer2.setAttribute(radio.elementRef.nativeElement, 'aria-checked', '' + checked);
    }
  }

  setValue(value: any | null | undefined): void {
    if (!this._children && !isNil(value)) {
      this._markForValueAfterContentInit = true;
      this._lastValue = value;
    } else {
      this._setValue(value);
      this._markForValueAfterContentInit = false;
      this._lastValue = value;
    }
  }

  ngAfterContentInit(): void {
    this._children.changes
      .pipe(takeUntil(this._destroy$), startWith(this._children))
      .subscribe((children: QueryList<ControlValueRadio>) => {
        this.children.reset(children.filter(child => child.controlValueRadioStandaloneParent === this));
        this._setValue(this._lastValue);
        this.children.notifyOnChanges();
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
