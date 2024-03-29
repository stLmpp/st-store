import { Component, DebugElement } from '@angular/core';
import { Control } from '../control/control';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { triggerEvent } from '../util-tests';
import { StControlModelModule } from '../st-control-model.module';

@Component({
  template: `
    <select [control]="control" multiple>
      <option class="option-1" [value]="1">1</option>
      <option class="option-2" [value]="2">2</option>
      <option class="option-3" [value]="3">3</option>
      <option class="option-4" [value]="4">4</option>
    </select>
    <select class="select-with-value" [control]="controlWithValue" multiple>
      <option [value]="1">1</option>
    </select>
  `,
})
class ControlComponent {
  control = new Control<number[]>([], { initialFocus: true });
  controlWithValue = new Control<number[]>([1]);
}

@Component({
  template: `
    <select [(model)]="model" multiple>
      <option class="option-1" [value]="1">1</option>
      <option class="option-2" [value]="2">2</option>
      <option class="option-3" [value]="3">3</option>
      <option class="option-4" [value]="4">4</option>
    </select>
  `,
})
class ModelComponent {
  model = new Control<number[]>([]);
}

describe('control value select multiple', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;
  let select: DebugElement;
  let selectWithValue: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule, StControlModelModule],
      declarations: [ControlComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    select = fixture.debugElement.query(By.css('select'));
    selectWithValue = fixture.debugElement.query(By.css('.select-with-value'));
  });

  it('should trigger onChange$', () => {
    select.nativeElement.options[0].selected = true;
    triggerEvent(select, 'change');
    triggerEvent(select, 'blur');
    fixture.detectChanges();
    expect(component.control.value).toEqual([1]);
  });

  it('should set the options as selected', () => {
    component.control.setValue([2, 4]);
    fixture.detectChanges();
    expect(select.nativeElement.selectedOptions.length).toBe(2);
    expect(select.nativeElement.options[1].selected).toBeTrue();
    expect(select.nativeElement.options[3].selected).toBeTrue();
  });

  it('should unselected all other options', () => {
    component.control.setValue([1, 2, 3]);
    fixture.detectChanges();
    expect(select.nativeElement.selectedOptions.length).toBe(3);
    expect(select.nativeElement.options[0].selected).toBeTrue();
    expect(select.nativeElement.options[1].selected).toBeTrue();
    expect(select.nativeElement.options[2].selected).toBeTrue();
    expect(select.nativeElement.options[3].selected).toBeFalse();
    component.control.setValue([4]);
    fixture.detectChanges();
    expect(select.nativeElement.selectedOptions.length).toBe(1);
    expect(select.nativeElement.options[0].selected).toBeFalse();
    expect(select.nativeElement.options[1].selected).toBeFalse();
    expect(select.nativeElement.options[2].selected).toBeFalse();
    expect(select.nativeElement.options[3].selected).toBeTrue();
  });

  it('should work with model', () => {
    expect(() => {
      TestBed.createComponent(ModelComponent).detectChanges();
    }).not.toThrow();
  });

  it('should set empty array if value is null or undefined', () => {
    component.control.setValue(null as any);
    fixture.detectChanges();
    expect(select.nativeElement.selectedIndex).toBe(-1);
  });

  it('should not set value if index is not found', () => {
    component.control.setValue([15]);
    fixture.detectChanges();
    expect(select.nativeElement.selectedIndex).toBe(-1);
  });

  it('should start with focus', () => {
    expect(select.nativeElement).toBe(document.activeElement);
  });
});
