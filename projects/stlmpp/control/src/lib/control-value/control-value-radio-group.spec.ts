import { Component, DebugElement, ViewChild } from '@angular/core';
import { Control } from '../control/control';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { ControlValueRadio } from './control-value-radio';
import { triggerEvent } from '../util-tests';

@Component({
  template: `
    <radio-group [control]="control">
      <input class="radio-1" type="radio" [value]="1" />
      <input class="radio-2" type="radio" [value]="2" />
    </radio-group>
  `,
})
class ControlComponent {
  @ViewChild(ControlValueRadio) controlValueRadio!: ControlValueRadio;
  control = new Control(1, { initialFocus: true });
}

@Component({
  template: ` <radio-group [control]="control" [disabled]="true">
    <input class="radio-1" type="radio" [value]="1" />
    <input class="radio-2" type="radio" [value]="2" />
  </radio-group>`,
})
class ControlDisabled {
  control = new Control<number | null>(null);
}

@Component({
  template: `
    <radio-group [(model)]="model">
      <input class="radio-1" type="radio" [value]="1" />
      <input class="radio-2" type="radio" [value]="2" />
    </radio-group>
  `,
})
class ModelComponent {
  model = 1;
}

@Component({
  template: ` <radio-group [control]="control"> </radio-group> `,
})
class ControlNoChildrenComponent {
  @ViewChild(ControlValueRadio) controlValueRadio!: ControlValueRadio;
  control = new Control(1, { initialFocus: true });
}

describe('control value radio group', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;
  let radio1: DebugElement;
  let radio2: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent, ControlDisabled, ModelComponent, ControlNoChildrenComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    radio1 = fixture.debugElement.query(By.css('.radio-1'));
    radio2 = fixture.debugElement.query(By.css('.radio-2'));
  });

  it('should start with value', () => {
    expect(radio1.nativeElement.checked).toBeTrue();
  });

  it('should trigger onChange$', () => {
    triggerEvent(radio2, 'change', true, 'checked');
    triggerEvent(radio2, 'blur');
    fixture.detectChanges();
    expect(component.control.value).toBe(2);
  });

  it('should disable all childrens', () => {
    component.control.disable();
    fixture.detectChanges();
    expect(radio1.attributes.disabled).toBeDefined();
    expect(radio2.attributes.disabled).toBeDefined();
  });

  it('should disable afterContentInit', () => {
    const fix = TestBed.createComponent(ControlDisabled);
    fix.detectChanges();
    radio1 = fix.debugElement.query(By.css('.radio-1'));
    radio2 = fix.debugElement.query(By.css('.radio-2'));
    expect(radio1.attributes.disabled).toBeDefined();
    expect(radio2.attributes.disabled).toBeDefined();
  });

  it('should set the checked of the radio', () => {
    component.control.setValue(2);
    fixture.detectChanges();
    expect(radio2.nativeElement.checked).toBeTrue();
  });

  it('should work with model', () => {
    expect(() => {
      TestBed.createComponent(ModelComponent).detectChanges();
    }).not.toThrow();
  });

  it('should start with focus', () => {
    expect(radio1.nativeElement).toBe(document.activeElement);
  });

  it('should not throw if initial focus with no childrens', () => {
    expect(() => {
      const fix = TestBed.createComponent(ControlNoChildrenComponent);
      fix.detectChanges();
    }).not.toThrow();
  });
});
