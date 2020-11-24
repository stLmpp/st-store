import { Component } from '@angular/core';
import { Control } from '../../control/control';
import { Validators } from '../validators';
import { TestBed } from '@angular/core/testing';
import { StControlModule } from '../../st-control.module';
import { By } from '@angular/platform-browser';
import { RequiredValidator } from './required';
import { createFakeControl } from '../../util-tests';

@Component({ template: '<input [control]="control">' })
class ControlComponent {
  control = new Control('', [Validators.required]);
}

describe('required validator', () => {
  it('should apply the attribute', async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(ControlComponent);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('input')).attributes.required).toBeDefined();
    expect(fixture.debugElement.query(By.css('input')).attributes['aria-required']).toBe('true');
  });

  it('should validate string', () => {
    const validator = new RequiredValidator<string>();
    expect(validator.validate(createFakeControl(''))).toBeTrue();
    expect(validator.validate(createFakeControl('A'))).toBeNull();
  });

  it('should validate array', () => {
    const validator = new RequiredValidator<string[]>();
    expect(validator.validate(createFakeControl<string[]>([]))).toBeTrue();
    expect(validator.validate(createFakeControl(['A']))).toBeNull();
  });

  it('should validate others', () => {
    const validator = new RequiredValidator();
    expect(validator.validate(createFakeControl({}))).toBeNull();
    expect(validator.validate(createFakeControl(null))).toBeTrue();
    expect(validator.validate(createFakeControl(undefined))).toBeTrue();
  });
});
