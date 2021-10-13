import { Component } from '@angular/core';
import { Control } from '../../control/control';
import { Validators } from '../validators';
import { TestBed } from '@angular/core/testing';
import { StControlModule } from '../../st-control.module';
import { By } from '@angular/platform-browser';
import { PatternValidator } from './pattern';
import { isRegExp } from 'st-utils';
import { createFakeControl } from '../../util-tests';

@Component({ template: '<input [control]="control">' })
class ControlComponent {
  control = new Control('', [Validators.pattern(/^GUI$/)]);
}

describe('pattern validator', () => {
  let validator: PatternValidator;

  beforeEach(() => {
    validator = new PatternValidator(/^GUI$/);
  });

  it('should apply the attribute', async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(ControlComponent);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('input')).attributes.pattern).toBe('^GUI$');
  });

  it('should create the validator with string', () => {
    const val = new PatternValidator('^GUI$');
    expect(val.attrs).toEqual({ pattern: '^GUI$' });
    // @ts-ignore
    expect(val.regExp).toBeDefined();
    // @ts-ignore
    expect(isRegExp(val.regExp)).toBeTrue();
  });

  it('should not validate if value is falsy', () => {
    expect(validator.validate(createFakeControl<string | null | undefined>(''))).toBeNull();
  });

  it('should return null if value matches the pattern', () => {
    expect(validator.validate(createFakeControl<string | null | undefined>('GUI'))).toBeNull();
  });

  it('should return error if value does not match the pattern', () => {
    expect(validator.validate(createFakeControl<string | null | undefined>('G'))).toEqual({
      expected: '^GUI$',
      actual: 'G',
    });
  });
});
