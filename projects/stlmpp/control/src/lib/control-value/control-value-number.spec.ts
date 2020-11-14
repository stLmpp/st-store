import { Component, DebugElement } from '@angular/core';
import { Control } from '../control/control';
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

  it('should trigger onChange$', () => {
    triggerEvent(input, 'input', '12');
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(component.control.value).toBe(12);
  });

  it('should trigger onChange$ with null if NaN', () => {
    triggerEvent(input, 'input', 'NOT A NUMBER');
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(component.control.value).toBeNull();
  });
});