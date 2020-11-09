import { Component, DebugElement } from '@angular/core';
import { Control } from '../control';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { triggerEvent } from '../util-tests';

@Component({ template: '<input type="number" [control]="control">' })
class ControlComponent {
  control = new Control();
}

describe('control value number', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;
  let input: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent],
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
});
