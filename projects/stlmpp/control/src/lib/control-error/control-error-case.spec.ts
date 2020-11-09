import { Component, DebugElement, Type, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { ControlErrorCase } from './control-error-case';
import { By } from '@angular/platform-browser';
import { triggerEvent } from '../util-tests';
import { ControlErrorShowWhen } from './control-error';
import { Control } from '../control/control';
import { Validators, ValidatorsModel } from '../validator/validators';

@Component({ template: `<small *error="'required'"></small>` })
class WithoutControlError {}

@Component({
  template: `<input [control]="control" />
    <ng-container [controlError]="control">
      <ng-template #caseRequired="controlErrorCase" error="required" let-error>
        <small class="required">{{ error }}</small>
      </ng-template>
      <small class="max-length" *error="'maxLength'; let error">{{ error.actual }}</small>
    </ng-container>`,
})
class ControlComponent {
  @ViewChild('controlErrorCase') controlErrorCaseDirective!: ControlErrorCase<'required'>;
  control = new Control('', [Validators.required, Validators.maxLength(8)]);
}

@Component({
  template: ` <input [control]="control" />
    <ng-container [controlError]="control">
      <small *error="error; showWhen: when; let error">{{ error?.required ? error.actual : error }}</small>
    </ng-container>`,
})
class ControlErrorCaseChange {
  control = new Control('', [Validators.required, Validators.minLength(3)]);
  when: ControlErrorShowWhen = 'dirty';
  error: keyof ValidatorsModel = 'required';
}

describe('control error case', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;

  function getRequired(): DebugElement {
    return fixture.debugElement.query(By.css('.required'));
  }

  function getMaxLength(): DebugElement {
    return fixture.debugElement.query(By.css('.max-length'));
  }

  function getComponent<T>(type: Type<T>): [ComponentFixture<T>, T] {
    const fix = TestBed.createComponent(type);
    return [fix, fix.componentInstance];
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [WithoutControlError, ControlComponent, ControlErrorCaseChange],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should throw if *error is used outside the [controlError]', () => {
    expect(() => {
      TestBed.createComponent(WithoutControlError).detectChanges();
    }).toThrow();
  });

  it('should return true (templateGuard)', () => {
    expect(ControlErrorCase.ngTemplateContextGuard(fixture.componentInstance.controlErrorCaseDirective, {})).toBeTrue();
  });

  it('should show', () => {
    component.control.markAsTouched();
    fixture.detectChanges();
    expect(getRequired()).not.toBeNull();
  });

  it('should remove', () => {
    const input = fixture.debugElement.query(By.css('input'));
    triggerEvent(input, 'input', '1');
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(getRequired()).toBeNull();
  });

  it('should update', () => {
    const input = fixture.debugElement.query(By.css('input'));
    triggerEvent(input, 'input', '123456789');
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(getMaxLength().nativeElement.innerText).toBe('9');
    triggerEvent(input, 'input', '1234567890');
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(getMaxLength().nativeElement.innerText).toBe('10');
  });

  it('should update the view with error if show when on child is updated', () => {
    const [fix, comp] = getComponent(ControlErrorCaseChange);
    fix.detectChanges();
    expect(fix.debugElement.query(By.css('small'))).toBeNull();
    comp.control.markAsTouched();
    fix.detectChanges();
    expect(fix.debugElement.query(By.css('small'))).toBeNull();
    comp.when = 'touched';
    fix.detectChanges();
    expect(fix.debugElement.query(By.css('small'))).not.toBeNull();
  });

  it('should update the view with error if error is updated on child', () => {
    const [fix, comp] = getComponent(ControlErrorCaseChange);
    fix.detectChanges();
    comp.control.markAsTouched();
    comp.when = 'touched';
    fix.detectChanges();
    expect(fix.debugElement.query(By.css('small')).nativeElement.innerText).toBe('true');
    comp.error = 'minLength';
    comp.control.setValue('A');
    fix.detectChanges();
    expect(fix.debugElement.query(By.css('small')).nativeElement.innerText).toBe('1');
  });
});
