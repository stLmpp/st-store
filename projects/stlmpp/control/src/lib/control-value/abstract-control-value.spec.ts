import { Component, DebugElement, forwardRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { triggerEvent } from '../util-tests';
import { Control } from '../control/control';
import { ControlValue } from './control-value';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({ template: '<input type="number" [control]="control">' })
class ControlComponent {
  control = new Control();
}

@Component({
  selector: 'custom-input[control]',
  template: '<input class="input" [control]="control">',
  providers: [{ provide: ControlValue, useExisting: forwardRef(() => CustomInputComponent) }],
})
class CustomInputComponent extends ControlValue implements OnInit, OnDestroy {
  private _destroy$ = new Subject();

  control = new Control();

  setValue(value: any | null | undefined): void {
    this.control.setValue(value);
  }

  ngOnInit(): void {
    this.control.value$.pipe(takeUntil(this._destroy$)).subscribe(value => {
      this.onChange$.next(value);
    });
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}

@Component({ template: '<custom-input [control]="control"></custom-input>' })
class CustomComponent {
  @ViewChild(CustomInputComponent) customInputComponent!: CustomInputComponent;

  control = new Control();
}

describe('control value number', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;
  let input: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent, CustomInputComponent, CustomComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('input'));
  });

  it('should trigger onTouched$', () => {
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(component.control.touched).toBeTrue();
  });

  it('should set the value on the input', () => {
    component.control.setValue(12);
    fixture.detectChanges();
    expect(input.nativeElement.value).toBe('12');
  });

  it('should clear the value if null or undefined', () => {
    component.control.setValue(12);
    fixture.detectChanges();
    component.control.setValue(null);
    fixture.detectChanges();
    expect(input.nativeElement.value).toBe('');
  });

  it('should disable the input', () => {
    component.control.disable();
    fixture.detectChanges();
    expect(input.attributes.disabled).toBeDefined();
  });

  it('should not call setValue of ControlValue if ControlValue is the one who changed the value of the control', () => {
    const fix = TestBed.createComponent(CustomComponent);
    fix.detectChanges();
    spyOn(fix.componentInstance.customInputComponent, 'setValue');
    triggerEvent(fix.debugElement.query(By.css('.input')), 'input', 'ASD');
    triggerEvent(fix.debugElement.query(By.css('.input')), 'blur');
    fix.detectChanges();
    expect(fix.componentInstance.customInputComponent.setValue).toHaveBeenCalledTimes(0);
  });
});
