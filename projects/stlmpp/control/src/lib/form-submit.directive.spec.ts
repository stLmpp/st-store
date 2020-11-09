import { Component, DebugElement } from '@angular/core';
import { ControlGroup } from './control-group';
import { Control } from './control';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from './st-control.module';
import { By } from '@angular/platform-browser';
import { triggerEvent } from './util-tests';

@Component({
  template: `
    <form [controlGroup]="controlGroup" (groupSubmit)="onSubmit($event)" (groupReset)="onReset($event)">
      <input controlName="control" />
      <button type="submit">Submit</button>
      <button type="reset">Reset</button>
    </form>
  `,
})
class ControlComponent {
  controlGroup = new ControlGroup({ control: new Control() });

  onSubmit($event: ControlGroup): void {}
  onReset($event: ControlGroup): void {}
}

describe('form submit', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;
  let form: DebugElement;
  let input: DebugElement;
  let submitBtn: DebugElement;
  let resetBtn: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    form = fixture.debugElement.query(By.css('form'));
    input = form.query(By.css('input'));
    submitBtn = form.query(By.css('button[type=submit]'));
    resetBtn = form.query(By.css('button[type=reset]'));
  });

  it('should add novalidate attribute', () => {
    expect(form.attributes.novalidate).toBeDefined();
  });

  it('should submit the form', () => {
    spyOn(component, 'onSubmit');
    submitBtn.nativeElement.click();
    fixture.detectChanges();
    expect(component.controlGroup.submitted).toBeTrue();
    expect(component.onSubmit).toHaveBeenCalledTimes(1);
  });

  it('should reset the form', () => {
    spyOn(component, 'onReset');
    triggerEvent(input, 'input', '1');
    fixture.detectChanges();
    submitBtn.nativeElement.click();
    fixture.detectChanges();
    expect(component.controlGroup.submitted).toBeTrue();
    expect(component.controlGroup.value.control).toBe('1');
    resetBtn.nativeElement.click();
    fixture.detectChanges();
    expect(component.controlGroup.submitted).toBeFalse();
    expect(component.controlGroup.value.control).toBeUndefined();
    expect(component.onReset).toHaveBeenCalledTimes(1);
  });
});
