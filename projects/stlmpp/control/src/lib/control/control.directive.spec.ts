import { Component, DebugElement, Directive, Input, ViewChild } from '@angular/core';
import { Control, ControlState } from './control';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { ControlValue } from '../control-value/control-value';
import { triggerEvent, wait } from '../util-tests';
import { ControlDirective } from './control.directive';
import { ControlValidator } from '../validator/validator';
import { Validators } from '../validator/validators';

@Directive({ selector: '[withoutControlValue][control]' })
class WithoutControlValue extends ControlValue {
  setValue(value: any): void {}
}

@Component({ template: '<div withoutControlValue [control]="control"></div>' })
class ComponentWithoutControlValue {
  @Input() control = new Control('');
}

@Directive({
  selector: '[withoutSets][control]',
  providers: [{ provide: ControlValue, useExisting: WithoutSets, multi: true }],
})
class WithoutSets extends ControlValue {
  setValue(value: any): void {}
}

@Directive({
  selector: '[withStateChanged][control]',
  providers: [{ provide: ControlValue, useExisting: WithStateChanged, multi: true }],
  exportAs: 'withStateChanged',
})
class WithStateChanged extends ControlValue {
  setValue(value: any): void {}
  override stateChanged(state: ControlState): void {}
}

@Component({
  template:
    '<div withoutSets [control]="control"></div><div withStateChanged [control]="control2" #withStateChanged="withStateChanged"></div>',
})
class WithoutSetsComponent {
  @ViewChild('withStateChanged') withStateChangedDirective!: WithStateChanged;

  control = new Control('');
  control2 = new Control('');
}

@Component({ template: '<input [control]="control" [disabled]="disabled">' })
class ControlComponent {
  @ViewChild(ControlDirective) controlDirective!: ControlDirective;

  @Input() control = new Control('');
  disabled?: boolean;
}

@Component({ template: '<input [control]="control" [disabled]="disabled">' })
class StartDisabled {
  control?: Control;
  disabled = true;
}

@Component({ template: '<input [control]="control">' })
class ControlInitialFocus {
  control = new Control('', { initialFocus: true });
}

@Component({ template: '<input [control]="control">' })
class ControlInitialFocusLazy {
  control?: Control<string>;
}

@Directive({
  selector: '[withoutFocus][control]',
  providers: [{ provide: ControlValue, useExisting: WithoutFocus, multi: true }],
  exportAs: 'withoutFocus',
})
class WithoutFocus extends ControlValue {
  setValue(value: any): void {}
}

@Component({
  template: '<div [control]="control" withoutFocus></div>',
})
class WithoutFocusComponent {
  control = new Control('', { initialFocus: true });
}

@Component({
  template: '<div [control]="control" withoutFocus></div>',
})
class WithoutFocusLazyComponent {
  control?: Control<string>;
}

describe('control directive', () => {
  let component: ControlComponent;
  let fixture: ComponentFixture<ControlComponent>;

  let input: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [
        ControlComponent,
        WithoutControlValue,
        ComponentWithoutControlValue,
        WithoutSets,
        WithoutSetsComponent,
        WithStateChanged,
        StartDisabled,
        ControlInitialFocus,
        ControlInitialFocusLazy,
        WithoutFocus,
        WithoutFocusComponent,
        WithoutFocusLazyComponent,
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('input'));
  });

  it('should throw if control value is not found', () => {
    expect(() => TestBed.createComponent(ComponentWithoutControlValue)).toThrow();
  });

  it('should not update dirty state if value is empty (change)', () => {
    triggerEvent(input, 'input', '');
    fixture.detectChanges();
    expect(component.control.dirty).toBeFalse();
  });

  it('should not update dirty state if value is empty (blur)', () => {
    component.control = new Control('', { updateOn: 'blur' });
    fixture.detectChanges();
    expect(component.control.dirty).toBeFalse();
    triggerEvent(input, 'input', '');
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(component.control.dirty).toBeFalse();
  });

  it('should not update dirty state if value is empty (submit)', () => {
    component.control = new Control('', { updateOn: 'submit' });
    fixture.detectChanges();
    expect(component.control.dirty).toBeFalse();
    triggerEvent(input, 'input', '');
    fixture.detectChanges();
    component.control.submit();
    expect(component.control.dirty).toBeFalse();
  });

  it('should update dirty state if value is not empty (change)', () => {
    triggerEvent(input, 'input', 'not empty');
    fixture.detectChanges();
    expect(component.control.dirty).toBeTrue();
  });

  it('should update dirty state if value is not empty (blur)', () => {
    component.control = new Control('', { updateOn: 'blur' });
    fixture.detectChanges();
    expect(component.control.dirty).toBeFalse();
    triggerEvent(input, 'input', 'not empty');
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(component.control.dirty).toBeTrue();
  });

  it('should update dirty state if value is not empty (submit)', () => {
    component.control = new Control('', { updateOn: 'submit' });
    fixture.detectChanges();
    expect(component.control.dirty).toBeFalse();
    triggerEvent(input, 'input', 'not empty');
    fixture.detectChanges();
    component.control.submit();
    expect(component.control.dirty).toBeTrue();
  });

  it(`should not throw if control value does not implement setDisabled`, () => {
    const fixtureWithoutSets = TestBed.createComponent(WithoutSetsComponent);
    fixtureWithoutSets.detectChanges();
    expect(() => {
      fixtureWithoutSets.componentInstance.control.disable();
      fixtureWithoutSets.detectChanges();
    }).not.toThrow();
  });

  it(`should not throw if control value does not implement stateChanged`, () => {
    const fixtureWithoutSets = TestBed.createComponent(WithoutSetsComponent);
    fixtureWithoutSets.detectChanges();
    expect(() => {
      fixtureWithoutSets.componentInstance.control.markAsTouched();
      fixtureWithoutSets.detectChanges();
    }).not.toThrow();
  });

  it('should call state changed on control value', async () => {
    const fixtureWithoutSets = TestBed.createComponent(WithoutSetsComponent);
    fixtureWithoutSets.detectChanges();
    spyOn(fixtureWithoutSets.componentInstance.withStateChangedDirective, 'stateChanged');
    fixtureWithoutSets.componentInstance.control2.markAsTouched();
    fixtureWithoutSets.detectChanges();
    await wait(1);
    expect(fixtureWithoutSets.componentInstance.withStateChangedDirective.stateChanged).toHaveBeenCalledTimes(1);
  });

  it('should change the attribute of validators (if equals)', () => {
    class NewRequiredValidator extends ControlValidator {
      name = 'newRequired';
      override attrs = { required: 'required' };
      validate(): null {
        return null;
      }
    }
    component.control.setValidator(Validators.required);
    fixture.detectChanges();
    expect(input.attributes.required).toBe('');
    component.control.setValidator(new NewRequiredValidator());
    fixture.detectChanges();
    expect(input.attributes.required).toBe('required');
    component.control.removeValidator('required');
    fixture.detectChanges();
    component.control.setValidator(Validators.required);
    fixture.detectChanges();
    expect(input.attributes.required).toBe('');
  });

  it('should remove classes if validator is removed', () => {
    class ClassValidator extends ControlValidator {
      name = 'classValidator';
      override classes = ['a'];
      validate(): null {
        return null;
      }
    }
    component.control.setValidator(new ClassValidator());
    fixture.detectChanges();
    expect(input.nativeElement).toHaveClass('a');
    component.control.removeValidator('classValidator');
    fixture.detectChanges();
    expect(input.nativeElement).not.toHaveClass('a');
  });

  it('should only mark as touched when blur', () => {
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(component.control.touched).toBeTrue();
  });

  it('should disable', () => {
    component.control.disable();
    fixture.detectChanges();
    expect(input.attributes.disabled).toBeDefined();
  });

  it('should not init', () => {
    // @ts-ignore
    spyOn(component.controlDirective, 'init');
    component.disabled = true;
    fixture.detectChanges();
    // @ts-ignore
    expect(component.controlDirective.init).toHaveBeenCalledTimes(0);
  });

  it('should start disabled', () => {
    const fix = TestBed.createComponent(StartDisabled);
    const comp = fix.componentInstance;
    fix.detectChanges();
    comp.control = new Control('', { disabled: false });
    fix.detectChanges();
    expect(comp.control.disabled).toBeTrue();
  });

  it('should start with focus', () => {
    const fix = TestBed.createComponent(ControlInitialFocus);
    fix.detectChanges();
    const inp = fix.debugElement.query(By.css('input')).nativeElement;
    const focused = document.activeElement;
    expect(inp).toBe(focused);
  });

  it('should start with focus (lazy control)', () => {
    const fix = TestBed.createComponent(ControlInitialFocusLazy);
    const comp = fix.componentInstance;
    fix.detectChanges();
    comp.control = new Control('', { initialFocus: true });
    fix.detectChanges();
    const inp = fix.debugElement.query(By.css('input')).nativeElement;
    const focused = document.activeElement;
    expect(inp).toBe(focused);
  });

  it(`should not throw error when focus method doesn't exists in the ControlValue`, () => {
    expect(() => {
      const fix = TestBed.createComponent(WithoutFocusComponent);
      fix.detectChanges();
    }).not.toThrow();
  });

  it(`should not throw error when focus method doesn't exists in the ControlValue (lazy control)`, () => {
    expect(() => {
      const fix = TestBed.createComponent(WithoutFocusLazyComponent);
      const comp = fix.componentInstance;
      fix.detectChanges();
      comp.control = new Control('', { initialFocus: true });
      fix.detectChanges();
    }).not.toThrow();
  });
});
