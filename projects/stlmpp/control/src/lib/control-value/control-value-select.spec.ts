import { Component, DebugElement } from '@angular/core';
import { Control } from '../control/control';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { triggerEvent } from '../util-tests';

@Component({
  template: `
    <select [control]="control">
      <option class="option-1" [value]="1">1</option>
      <option class="option-2" [value]="2">2</option>
    </select>
    <select class="select-with-value" [control]="controlWithValue">
      <option [value]="1">1</option>
    </select>
  `,
})
class ControlComponent {
  control = new Control<number | null>(null);
  controlWithValue = new Control(1);
}

@Component({
  template: `
    <select [(model)]="model">
      <option class="option-1" [value]="1">1</option>
      <option class="option-2" [value]="2">2</option>
    </select>
  `,
})
class ModelComponent {
  model = null;
}

describe('control value select', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;
  let select: DebugElement;
  let selectWithValue: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent, ModelComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    select = fixture.debugElement.query(By.css('select'));
    selectWithValue = fixture.debugElement.query(By.css('.select-with-value'));
  });

  it('should trigger onChange$', () => {
    triggerEvent(select, 'change', 0, 'selectedIndex');
    triggerEvent(select, 'blur');
    fixture.detectChanges();
    expect(component.control.value).toBe(1);
  });

  it('should update the select and the selected option', () => {
    component.control.setValue(1);
    fixture.detectChanges();
    expect(select.nativeElement.selectedIndex).toBe(0);
    expect(select.nativeElement.value).toBe('1');
  });

  it('should create with value', () => {
    expect(selectWithValue.nativeElement.value).toBe('1');
    expect(selectWithValue.nativeElement.selectedIndex).toBe(0);
  });

  it('should work with model', () => {
    expect(() => {
      TestBed.createComponent(ModelComponent).detectChanges();
    }).not.toThrow();
  });
});
