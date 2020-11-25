import { AfterViewInit, Directive, ElementRef, Host, Input, OnDestroy, Optional, Renderer2 } from '@angular/core';
import { ControlValueRadioParent } from './control-value-radio-parent';

@Directive({
  selector: 'input[type=radio]:not([control]),input[type=radio]:not([controlName])',
})
export class ControlValueRadio implements AfterViewInit, OnDestroy {
  constructor(
    public elementRef: ElementRef<HTMLInputElement>,
    private renderer2: Renderer2,
    @Host() @Optional() public controlValueRadioStandaloneParent?: ControlValueRadioParent
  ) {}

  @Input() value: any;

  private changeListener?: () => void;
  private touchedListener?: () => void;

  private onChange($event: Event): void {
    const target = $event.target as HTMLInputElement;
    if (target.checked) {
      this.controlValueRadioStandaloneParent!.onChange(this.value);
    }
  }

  private onBlur(): void {
    this.controlValueRadioStandaloneParent?.onTouched$.next();
  }

  ngAfterViewInit(): void {
    if (this.controlValueRadioStandaloneParent) {
      this.changeListener = this.renderer2.listen(this.elementRef.nativeElement, 'change', ($event: Event) =>
        this.onChange($event)
      );
      this.touchedListener = this.renderer2.listen(this.elementRef.nativeElement, 'blur', () => {
        this.onBlur();
      });
      this.renderer2.setAttribute(
        this.elementRef.nativeElement,
        'name',
        '' + this.controlValueRadioStandaloneParent.id
      );
    }
  }

  ngOnDestroy(): void {
    this.changeListener?.();
  }
}
