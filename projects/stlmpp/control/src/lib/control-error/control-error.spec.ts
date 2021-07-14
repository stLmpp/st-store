import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { Component, DebugElement, Input, ViewChild } from '@angular/core';
import { Validators } from '../validator/validators';
import { By } from '@angular/platform-browser';
import { triggerEvent } from '../util-tests';
import { ControlError, ControlErrorShowWhen } from './control-error';
import { ControlGroup } from '../control-group/control-group';
import { Control } from '../control/control';

@Component({
  template: `
    <input [control]="control" />
    <ng-container [controlError]="control" [showWhen]="showWhen">
      <small class="required" *error="'required'; showWhen: showWhenRequired; let error">{{ error }}</small>
      <small class="max-length" *error="'maxLength'; let error">{{ error.actual }} - {{ error.required }}</small>
    </ng-container>
  `,
})
class ControlComponent {
  @Input() control = new Control('', [Validators.required, Validators.maxLength(8)]);
  @Input() showWhen: ControlErrorShowWhen = null;
  @Input() showWhenRequired: ControlErrorShowWhen = null;
}

@Component({
  template: `<ng-container controlError="not exists"></ng-container>`,
})
class WithoutParent {}

@Component({
  template: `<div [controlGroup]="controlGroup"><ng-container controlError="not exists"></ng-container></div>`,
})
class WithoutControl {
  controlGroup = new ControlGroup({});
}

@Component({
  template: `<div [controlGroup]="controlGroup"><ng-container controlError="notControl"></ng-container></div>`,
})
class ControlNotControl {
  controlGroup = new ControlGroup({ notControl: new ControlGroup({}) });
}

@Component({
  template: `<div [controlGroup]="controlGroup">
    <ng-container #controlErrorRef="controlError" controlError="control"></ng-container>
  </div>`,
})
class ControlWithName {
  @ViewChild('controlErrorRef') controlErrorDirective!: ControlError;

  controlGroup = new ControlGroup<{ control: string }>({ control: new Control('') });
}

describe('control error', () => {
  let fixControl: ComponentFixture<ControlComponent>;
  let compControl: ControlComponent;
  let inputControl: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent, WithoutParent, WithoutControl, ControlNotControl, ControlWithName],
    }).compileComponents();
    fixControl = TestBed.createComponent(ControlComponent);
    compControl = fixControl.componentInstance;
    fixControl.detectChanges();
    inputControl = fixControl.debugElement.query(By.css('input'));
  });

  it('should create the component with required error', () => {
    compControl.control.markAsTouched();
    fixControl.detectChanges();
    const smallRequired = fixControl.debugElement.query(By.css('.required'));
    expect(smallRequired).not.toBeNull();
    expect(smallRequired.nativeElement.innerText).toBe('true');
  });

  it('should remove the required message', () => {
    triggerEvent(inputControl, 'input', '1');
    triggerEvent(inputControl, 'blur');
    fixControl.detectChanges();
    expect(fixControl.debugElement.query(By.css('.required'))).toBeNull();
  });

  it('should add max-length message', () => {
    triggerEvent(inputControl, 'input', '123456789');
    triggerEvent(inputControl, 'blur');
    fixControl.detectChanges();
    const maxLength = fixControl.debugElement.query(By.css('.max-length'));
    expect(maxLength).not.toBeNull();
    expect(maxLength.nativeElement.innerText).toBe('9 - 8');
  });

  it('should update max-length message', () => {
    triggerEvent(inputControl, 'input', '123456789');
    triggerEvent(inputControl, 'blur');
    fixControl.detectChanges();
    const maxLength = fixControl.debugElement.query(By.css('.max-length'));
    expect(maxLength).not.toBeNull();
    expect(maxLength.nativeElement.innerText).toBe('9 - 8');
    triggerEvent(inputControl, 'input', '1234567890');
    triggerEvent(inputControl, 'blur');
    fixControl.detectChanges();
    expect(maxLength).not.toBeNull();
    expect(maxLength.nativeElement.innerText).toBe('10 - 8');
  });

  it('should show error only when dirty', () => {
    compControl.showWhen = 'dirty';
    fixControl.detectChanges();
    expect(fixControl.debugElement.query(By.css('.required'))).toBeNull();
    compControl.control.markAsDirty();
    fixControl.detectChanges();
    expect(fixControl.debugElement.query(By.css('.required'))).not.toBeNull();
  });

  it('should show error only when dirty and error has showError prop', () => {
    compControl.showWhenRequired = 'dirty';
    fixControl.detectChanges();
    expect(fixControl.debugElement.query(By.css('.required'))).toBeNull();
    compControl.control.markAsTouched();
    fixControl.detectChanges();
    expect(fixControl.debugElement.query(By.css('.required'))).toBeNull();
    compControl.control.markAsDirty();
    fixControl.detectChanges();
    expect(fixControl.debugElement.query(By.css('.required'))).not.toBeNull();
  });

  it('should throw if control parent is not found', () => {
    expect(() => {
      TestBed.createComponent(WithoutParent).detectChanges();
    }).toThrow();
  });

  it('should throw if control name is not found', () => {
    expect(() => {
      TestBed.createComponent(WithoutControl).detectChanges();
    }).toThrow();
  });

  it('should throw if control name is not a control', () => {
    expect(() => {
      TestBed.createComponent(ControlNotControl).detectChanges();
    }).toThrow();
  });

  it('should create with control name', () => {
    const fix = TestBed.createComponent(ControlWithName);
    fix.detectChanges();
    // @ts-ignore
    expect(fix.componentInstance.controlErrorDirective._control).toBeDefined();
    // @ts-ignore
    expect(fix.componentInstance.controlErrorDirective._control).toBeInstanceOf(Control);
  });

  it('should clear errors when control is reset', () => {
    compControl.showWhen = 'touched';
    fixControl.detectChanges();
    compControl.control.markAsTouched();
    fixControl.detectChanges();
    compControl.control.reset();
    fixControl.detectChanges();
    const smallRequired = fixControl.debugElement.query(By.css('.required'));
    expect(smallRequired).toBeNull();
  });
});
