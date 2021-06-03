import { Control } from './control';
import { take } from 'rxjs/operators';
import { Component, DebugElement, Input } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { AsyncValidator, triggerEvent, wait } from '../util-tests';
import { ControlGroup } from '../control-group/control-group';
import { ControlValidator } from '../validator/validator';
import { Validators } from '../validator/validators';

@Component({
  template:
    '<input class="control" [control]="control"><div [controlGroup]="controlGroup"><input controlName="control"></div>',
})
class ControlComponent {
  @Input() control = new Control('');
  @Input() controlGroup = new ControlGroup<{ control: string }>({ control: new Control('') });
}

describe('control', () => {
  let component: ControlComponent;
  let fixture: ComponentFixture<ControlComponent>;

  let input: DebugElement;
  let group: DebugElement;
  let groupInput: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule.forRoot()],
      declarations: [ControlComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('.control'));
    group = fixture.debugElement.query(By.css('div'));
    groupInput = fixture.debugElement.query(By.css('div input'));
  });

  it('should create component with controls', () => {
    expect(component).toBeDefined();
  });

  it('should create a control', () => {
    const control = new Control(undefined);
    expect(control).toBeDefined();
    expect(control.value).toBeUndefined();
  });

  it('should create with value', () => {
    const control = new Control(1);
    expect(control.value).toBe(1);
    control.value$.pipe(take(1)).subscribe(value => {
      expect(value).toBe(1);
    });
  });

  it('should create with one validator', () => {
    const control = new Control(1, Validators.required);
    expect(control.validators.length).toBe(1);
  });

  it('should create with multiple validators', () => {
    const control = new Control(1, [Validators.required, Validators.max(1)]);
    expect(control.validators.length).toBe(2);
  });

  it('should create with options', () => {
    const control = new Control(1, { validators: [Validators.required], updateOn: 'blur', disabled: true });
    expect(control.validators.length).toBe(1);
    expect(control.updateOn).toBe('blur');
    expect(control.disabled).toBeTrue();
  });

  it('should get the parent if exists', () => {
    const control = new Control('');
    const controlGroup = new ControlGroup<{ control: string }>({ control: new Control('') });
    expect(control.parent).toBeUndefined();
    expect(controlGroup.get('control').parent).toBeDefined();
  });

  it('should get the pristine/dirty state', () => {
    expect(component.control.pristine).toBeTrue();
    expect(component.control.dirty).toBeFalse();
    triggerEvent(input, 'input', '1');
    fixture.detectChanges();
    expect(component.control.pristine).toBeFalse();
    expect(component.control.dirty).toBeTrue();
  });

  it('should get the touched/untouched state', () => {
    const control = component.control;
    expect(control.touched).toBeFalse();
    expect(control.untouched).toBeTrue();
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(control.untouched).toBeFalse();
    expect(control.touched).toBeTrue();
  });

  it('should get the valid/invalid state', () => {
    component.control.setValidator(Validators.required);
    const control = component.control;
    expect(control.valid).toBeFalse();
    expect(control.invalid).toBeTrue();
    triggerEvent(input, 'input', '1');
    fixture.detectChanges();
    expect(control.invalid).toBeFalse();
    expect(control.valid).toBeTrue();
  });

  it('should get the disabled/enabled state', () => {
    const control = component.control;
    expect(control.disabled).toBeFalse();
    expect(control.enabled).toBeTrue();
    control.disable();
    fixture.detectChanges();
    expect(control.disabled).toBeTrue();
    expect(control.enabled).toBeFalse();
  });

  it('should init with disabled state', () => {
    const control = new Control('', { disabled: true });
    control.init();
    expect(control.disabled).toBeTrue();
    expect(control.enabled).toBeFalse();
  });

  it('should set the updateOn option', () => {
    const control = new Control('');
    control.setUpdateOn('submit');
    expect(control.updateOn).toBe('submit');
    control.setUpdateOn(undefined);
    expect(control.updateOn).toBe('submit');
  });

  it('should mark as touched only once', () => {
    const control = new Control('');
    const sub = jasmine.createSpy('sub');
    control.stateChanged$.subscribe(sub);
    control.markAsTouched();
    expect(control.touched).toBeTrue();
    expect(sub).toHaveBeenCalledTimes(1);
    control.markAsTouched();
    expect(control.touched).toBeTrue();
    expect(sub).toHaveBeenCalledTimes(1);
  });

  it('should mark as dirty only once', () => {
    const control = new Control('');
    const sub = jasmine.createSpy('sub');
    control.stateChanged$.subscribe(sub);
    control.markAsDirty();
    expect(control.dirty).toBeTrue();
    expect(sub).toHaveBeenCalledTimes(1);
    control.markAsDirty();
    expect(control.dirty).toBeTrue();
    expect(sub).toHaveBeenCalledTimes(1);
  });

  it('should send classes of validators', () => {
    class CustomValidator extends ControlValidator {
      name = 'custom';
      classes = ['validator', 'validator2'];
      validate(): null {
        return null;
      }
    }
    class CustomValidatorTwo extends ControlValidator {
      name = 'custom2';
      classes = 'validator3';
      validate(): null {
        return null;
      }
    }
    const sub = jasmine.createSpy('sub');
    component.control = new Control('', [new CustomValidator(), new CustomValidatorTwo()]);
    const control = component.control;
    control.classesChanged$.subscribe(sub);
    fixture.detectChanges();
    expect(sub).toHaveBeenCalledTimes(1);
    expect(sub).toHaveBeenCalledWith(['validator', 'validator2', 'validator3']);
  });

  it('should send attributes of validators', () => {
    component.control = new Control('', [Validators.required, Validators.maxLength(1)]);
    const control = component.control;
    const sub = jasmine.createSpy('sub');
    control.attributesChanged$.subscribe(sub);
    fixture.detectChanges();
    expect(sub).toHaveBeenCalledTimes(1);
    expect(sub).toHaveBeenCalledWith({ required: undefined, 'aria-required': true, maxLength: 1 });
  });

  it('should set validator', () => {
    const control = component.control;
    expect(control.validators.length).toBe(0);
    control.setValidator(Validators.required);
    expect(control.validators.length).toBe(1);
    expect(control.invalid).toBeTrue();
  });

  it('should only set unique validators', () => {
    const control = component.control;
    spyOn(control, 'runValidator');
    control.setValidator(Validators.required);
    expect(control.runValidator).toHaveBeenCalledTimes(1);
    expect(control.validators.length).toBe(1);
    control.setValidator(Validators.required);
    expect(control.runValidator).toHaveBeenCalledTimes(1);
    expect(control.validators.length).toBe(1);
    control.setValidators([Validators.required]);
    expect(control.runValidator).toHaveBeenCalledTimes(1);
    expect(control.validators.length).toBe(1);
  });

  it('should set multiple validators', () => {
    const control = component.control;
    control.setValidators([Validators.required, Validators.maxLength(1), Validators.required]);
    expect(control.validators.length).toBe(2);
  });

  it('should remove validator', () => {
    const control = component.control;
    control.setValidators([Validators.required, Validators.maxLength(1)]);
    expect(control.validators.length).toBe(2);
    control.removeValidator('required');
    expect(control.validators.length).toBe(1);
    control.removeValidators(['maxLength']);
    expect(control.validators.length).toBe(0);
    control.setValidator(Validators.required);
    expect(control.hasValidator('required')).toBeTrue();
    control.removeValidator(Validators.required);
    expect(control.hasValidator('required')).toBeFalse();
  });

  it('should get the pending state', async () => {
    const control = component.control;
    control.setValidator(new AsyncValidator());
    expect(control.pending).toBeTrue();
    await wait(15);
    expect(control.pending).toBeFalse();
  });

  it('should remove the pending state if async validator is removed before validation is done', async () => {
    const control = component.control;
    control.setValidator(new AsyncValidator());
    expect(control.pending).toBeTrue();
    await wait(5);
    control.removeValidator('asyncValidator');
    expect(control.pending).toBeFalse();
  });

  it('should remove validator only if it exists', async () => {
    const control = component.control;
    const sub = jasmine.createSpy('sub');
    control.attributesChanged$.subscribe(sub);
    control.setValidators([new AsyncValidator()]);
    expect(sub).toHaveBeenCalledTimes(1);
    control.removeValidator('asyncValidator');
    expect(sub).toHaveBeenCalledTimes(2);
    control.removeValidator('do not exists');
    expect(sub).toHaveBeenCalledTimes(2);
    control.setValidators([new AsyncValidator(), Validators.required]);
    expect(sub).toHaveBeenCalledTimes(3);
    control.removeValidators([]);
    expect(sub).toHaveBeenCalledTimes(3);
    control.removeValidators(['do not exists']);
    expect(sub).toHaveBeenCalledTimes(3);
    control.removeValidators(['asyncValidator', 'required']);
    expect(sub).toHaveBeenCalledTimes(4);
  });

  it('should set the value', () => {
    const control = component.control;
    control.setValue('1');
    expect(control.value).toBe('1');
    control.patchValue('2');
    expect(control.value).toBe('2');
  });

  it('should set the value without emiting the change', () => {
    const sub = jasmine.createSpy('sub');
    const control = component.control;
    control.valueChanges$.subscribe(sub);
    control.setValue('2', { emitChange: false });
    expect(sub).toHaveBeenCalledTimes(0);
  });

  it('should remove pending if error is thrown', async () => {
    const control = component.control;
    control.setValidator(new AsyncValidator(true, true));
    expect(control.pending).toBeTrue();
    await wait(7);
    expect(control.pending).toBeFalse();
  });

  it(`should not run validator if it does not exists`, () => {
    const control = component.control;
    // @ts-ignore
    spyOn(control, '_getValidationError');
    control.runValidator('do not exists');
    // @ts-ignore
    expect(control._getValidationError).toHaveBeenCalledTimes(0);
  });

  it('should return the error of a validator', () => {
    const control = component.control;
    control.setValidator(Validators.required);
    expect(control.getError('required')).toBeTrue();
    control.setValue('1');
    expect(control.getError('required')).toBeUndefined();
  });

  it('should return whether there is any error', () => {
    const control = component.control;
    const sub = jasmine.createSpy('sub');
    control.selectHasError('required').subscribe(sub);
    control.setValidator(Validators.required);
    expect(sub).toHaveBeenCalledTimes(2);
    expect(sub).toHaveBeenCalledWith(true);
    control.setValue('1');
    expect(sub).toHaveBeenCalledTimes(3);
    expect(sub).toHaveBeenCalledWith(false);
  });

  it('should enable the control', () => {
    const control = component.control;
    control.disable();
    expect(control.enabled).toBeFalse();
    control.enable();
    expect(control.enabled).toBeTrue();
    control.enable(false);
    expect(control.enabled).toBeFalse();
  });

  it('should mark as invalid', () => {
    const control = component.control;
    const sub = jasmine.createSpy('sub');
    control.stateChanged$.subscribe(sub);
    expect(control.invalid).toBeFalse();
    control.markAsInvalid();
    expect(sub).toHaveBeenCalledTimes(1);
    expect(control.invalid).toBeTrue();
    control.markAsInvalid(false);
    expect(sub).toHaveBeenCalledTimes(2);
    expect(control.invalid).toBeFalse();
    control.markAsInvalid(false);
    expect(sub).toHaveBeenCalledTimes(2);
  });

  it('should reset the control', () => {
    const control: Control<string> = (component.control = new Control('', [Validators.required]));
    fixture.detectChanges();
    control.setValidators([Validators.email]);
    triggerEvent(input, 'input', 'teste2');
    fixture.detectChanges();
    expect(control.value).toBe('teste2');
    expect(control.hasError('required')).toBeFalse();
    expect(control.hasError('email')).toBeTrue();
    expect(control.validators.length).toBe(2);
    control.reset();
    fixture.detectChanges();
    expect(control.value).toBe('');
    expect(control.hasError('required')).toBeTrue();
    expect(control.hasError('email')).toBeFalse();
    expect(control.validators.length).toBe(1);
  });

  it('should emit an error list', () => {
    const sub = jasmine.createSpy('sub');
    const control = component.control;
    control.errorList$.subscribe(sub);
    control.setValidators([Validators.required]);
    expect(sub).toHaveBeenCalledTimes(2);
    expect(sub).toHaveBeenCalledWith([{ key: 'required', value: true }]);
  });

  it('should emit changes on blur', () => {
    const sub = jasmine.createSpy('sub');
    const control = (component.control = new Control('', { updateOn: 'blur' }));
    fixture.detectChanges();
    control.valueChanges$.subscribe(sub);
    triggerEvent(input, 'input', '1');
    expect(sub).toHaveBeenCalledTimes(0);
    triggerEvent(input, 'input', '11');
    expect(sub).toHaveBeenCalledTimes(0);
    triggerEvent(input, 'blur');
    expect(sub).toHaveBeenCalledTimes(1);
    expect(sub).toHaveBeenCalledWith('11');
  });

  it('should emit changes on submit', () => {
    const sub = jasmine.createSpy('sub');
    const control = (component.control = new Control('', { updateOn: 'submit' }));
    fixture.detectChanges();
    control.valueChanges$.subscribe(sub);
    triggerEvent(input, 'input', '1');
    expect(sub).toHaveBeenCalledTimes(0);
    triggerEvent(input, 'input', '11');
    expect(sub).toHaveBeenCalledTimes(0);
    triggerEvent(input, 'blur');
    expect(sub).toHaveBeenCalledTimes(0);
    control.submit();
    expect(sub).toHaveBeenCalledTimes(1);
    expect(sub).toHaveBeenCalledWith('11');
  });

  it('should set async initial validator', () => {
    const control = new Control('', [new AsyncValidator()]);
    expect(control.validationCancel.asyncValidator).toBeDefined();
  });

  it('should get all errors', () => {
    component.control.setValidators([Validators.email, Validators.minLength(3)]);
    fixture.detectChanges();
    component.control.setValue('A');
    fixture.detectChanges();
    expect(component.control.getErrors()).toEqual({ email: true, minLength: { required: 3, actual: 1 } });
  });

  it('should return null if there are no errors', () => {
    expect(component.control.getErrors()).toBeNull();
  });

  it('should check if has any error', () => {
    component.control.setValidator(Validators.required);
    fixture.detectChanges();
    expect(component.control.hasAnyError()).toBeTrue();
    triggerEvent(input, 'input', 'A');
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(component.control.hasAnyError()).toBeFalse();
  });

  it('should emit if has any error', () => {
    component.control.setValidator(Validators.required);
    fixture.detectChanges();
    const sub = jasmine.createSpy('sub');
    component.control.hasErrors$.subscribe(sub);
    expect(sub).toHaveBeenCalledWith(true);
    triggerEvent(input, 'input', 'A');
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(sub).toHaveBeenCalledWith(false);
  });

  it('should check if has errors', () => {
    component.control.setValidators([Validators.required, Validators.maxLength(3)]);
    fixture.detectChanges();
    expect(component.control.hasErrors(['required'])).toBeTrue();
    expect(component.control.hasErrors([Validators.required])).toBeTrue();
    component.control.removeValidators(['required', 'maxLength']);
    fixture.detectChanges();
    expect(component.control.hasErrors(['required'])).toBeFalse();
  });

  it('should not emit changes if the value is the same as the previous', () => {
    const subvalue = jasmine.createSpy('value$');
    const subchanges = jasmine.createSpy('valueChanges$');
    component.control.value$.subscribe(subvalue);
    component.control.valueChanges$.subscribe(subchanges);
    triggerEvent(input, 'input', 'A');
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(subvalue).toHaveBeenCalledTimes(2);
    expect(subvalue).toHaveBeenCalledWith('A');
    expect(subchanges).toHaveBeenCalledTimes(1);
    triggerEvent(input, 'input', 'B');
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(subvalue).toHaveBeenCalledTimes(3);
    expect(subvalue).toHaveBeenCalledWith('B');
    expect(subchanges).toHaveBeenCalledTimes(2);
    expect(subchanges).toHaveBeenCalledWith('B');
    triggerEvent(input, 'input', 'B');
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(subvalue).toHaveBeenCalledTimes(3);
    expect(subvalue).toHaveBeenCalledWith('B');
    expect(subchanges).toHaveBeenCalledTimes(2);
    expect(subchanges).toHaveBeenCalledWith('B');
  });

  it('should work without a control directive', () => {
    const control = new Control<string>('', [Validators.required, Validators.minLength(3)]);
    expect(control.invalid).toBeTrue();
    expect(control.value).toBe('');
    expect(control.getError('required')).toEqual(true);
    control.setValue('TESTE');
    expect(control.invalid).toBeFalse();
    expect(control.value).toBe('TESTE');
    expect(control.getError('required')).toBeUndefined();
  });

  it('should have a unique id', () => {
    const control1 = new Control<string>('');
    const control2 = new Control<string>('');
    expect(control1.uniqueId).not.toBe(control2.uniqueId);
  });

  it('should return if has validator', () => {
    const control = new Control('', [Validators.required]);
    expect(control.hasValidator('required')).toBeTrue();
    control.removeValidator('required');
    expect(control.hasValidator(Validators.required)).toBeFalse();
  });

  it('should return if has validators', () => {
    const control = new Control('', [Validators.required, Validators.maxLength(2)]);
    expect(control.hasValidators(['required'])).toBeTrue();
    expect(control.hasValidators(['maxLength'])).toBeTrue();
    expect(control.hasValidators([Validators.required])).toBeTrue();
    control.removeValidator('required');
    expect(control.hasValidators([Validators.maxLength(2)])).toBeTrue();
    expect(control.hasValidators(['required'])).toBeFalse();
  });

  it('should return if has any validator', () => {
    const control = new Control('');
    expect(control.hasAnyValidators()).toBeFalse();
    control.setValidator(Validators.required);
    expect(control.hasAnyValidators()).toBeTrue();
  });
});
