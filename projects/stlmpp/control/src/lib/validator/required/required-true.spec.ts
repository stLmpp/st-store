import { Component } from '@angular/core';
import { Control } from '../../control/control';
import { Validators } from '../validators';
import { TestBed } from '@angular/core/testing';
import { StControlModule } from '../../st-control.module';
import { By } from '@angular/platform-browser';
import { createFakeControl } from '../../util-tests';
import { RequiredTrueValidator } from './required-true';

@Component({ template: '<input type="checkbox" [control]="control">' })
class ControlComponent {
  control = new Control(false, [Validators.requiredTrue]);
}

describe('required true validator', () => {
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

  it('should validate', () => {
    const validator = new RequiredTrueValidator();
    expect(validator.validate(createFakeControl<boolean>(false))).toBeTrue();
    expect(validator.validate(createFakeControl<boolean>(true))).toBeNull();
  });
});
