import { Component, DebugElement, ViewChild } from '@angular/core';
import { Control } from '../control';
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

  control = new Control(1);
}

@Component({ template: '<input type="radio">' })
class ControlWithoutRadioGroup {
  @ViewChild(ControlValueRadio) controlValueRadio!: ControlValueRadio;
}

describe('control value radio', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;
  let radio1: DebugElement;
  let radio2: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent, ControlWithoutRadioGroup],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    radio1 = fixture.debugElement.query(By.css('.radio-1'));
    radio2 = fixture.debugElement.query(By.css('.radio-2'));
  });

  it('should remove listener when destroyed', () => {
    // @ts-ignore
    spyOn(component.controlValueRadio, 'changeListener');
    fixture.destroy();
    // @ts-ignore
    expect(component.controlValueRadio.changeListener).toHaveBeenCalledTimes(1);
  });

  it('should not add listener if outside of radioGroup', () => {
    const fix = TestBed.createComponent(ControlWithoutRadioGroup);
    fix.detectChanges();
    const comp = fix.componentInstance;
    const input = fix.debugElement.query(By.css('input'));
    // @ts-ignore
    spyOn(comp.controlValueRadio, 'onChange');
    triggerEvent(input, 'change');
    triggerEvent(input, 'blur');
    fix.detectChanges();
    // @ts-ignore
    expect(comp.controlValueRadio.onChange).toHaveBeenCalledTimes(0);
  });

  it('should trigger onChange', () => {
    triggerEvent(radio2, 'change', true, 'checked');
    triggerEvent(radio2, 'blur');
    fixture.detectChanges();
    expect(component.control.value).toBe(2);
  });

  it('should not trigger onChange if input is not checked', () => {
    triggerEvent(radio2, 'change', false, 'checked');
    triggerEvent(radio2, 'blur');
    fixture.detectChanges();
    expect(component.control.value).toBe(1);
  });
});
