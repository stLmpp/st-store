import { AfterViewInit, Directive, ElementRef, Host, Input, OnDestroy, Optional, Renderer2 } from '@angular/core';
import { ControlValueRadioParent } from './control-value-radio-parent';

@Directive({
  selector: `input[type=radio]:not([control]):not([controlName]):not([model])`,
})
export class ControlValueRadio implements AfterViewInit, OnDestroy {
  constructor(
    public elementRef: ElementRef<HTMLInputElement>,
    private renderer2: Renderer2,
    @Host() @Optional() public controlValueRadioStandaloneParent?: ControlValueRadioParent
  ) {}

  private _changeListener?: () => void;
  private _touchedListener?: () => void;

  @Input() value: any;

  private _onChange($event: Event): void {
    const target = $event.target as HTMLInputElement;
    if (target.checked) {
      this.controlValueRadioStandaloneParent!.onChange(this.value);
    }
  }

  private _onBlur(): void {
    this.controlValueRadioStandaloneParent?.onTouched$.next();
  }

  ngAfterViewInit(): void {
    if (this.controlValueRadioStandaloneParent) {
      this._changeListener = this.renderer2.listen(this.elementRef.nativeElement, 'change', ($event: Event) =>
        this._onChange($event)
      );
      this._touchedListener = this.renderer2.listen(this.elementRef.nativeElement, 'blur', () => {
        this._onBlur();
      });
      this.renderer2.setAttribute(
        this.elementRef.nativeElement,
        'name',
        '' + this.controlValueRadioStandaloneParent.id
      );
    }
  }

  ngOnDestroy(): void {
    this._changeListener?.();
    this._touchedListener?.();
  }
}
