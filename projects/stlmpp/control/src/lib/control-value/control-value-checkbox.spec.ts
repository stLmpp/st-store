import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { triggerEvent } from '../util-tests';
import { Control } from '../control/control';

@Component({ template: '<input type="checkbox" [control]="control" [indeterminate]="indeterminate">' })
class ControlComponent {
  control = new Control(false);
  indeterminate = false;
}

@Component({ template: '<input type="checkbox" [(model)]="model">' })
class ModelComponent {
  model = true;
}

describe('control value checkbox', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;
  let input: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent, ModelComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('input'));
  });

  it('should set the indeterminate state', () => {
    component.indeterminate = true;
    fixture.detectChanges();
    expect(input.nativeElement.indeterminate).toBeTrue();
  });

  it('should trigger onChange$', () => {
    triggerEvent(input, 'change', true, 'checked');
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(component.control.value).toBeTrue();
  });

  it('should set the value', () => {
    component.control.setValue(true);
    fixture.detectChanges();
    expect(input.nativeElement.checked).toBeTrue();
    expect(input.attributes['aria-checked']).toBe('true');
  });

  it('should work with model', () => {
    expect(() => {
      TestBed.createComponent(ModelComponent).detectChanges();
    }).not.toThrow();
  });
});
