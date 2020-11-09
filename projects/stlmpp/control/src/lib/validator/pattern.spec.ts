import { Component } from '@angular/core';
import { Control } from '../control';
import { Validators } from './validators';
import { TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { PatternValidator } from './pattern';
import { isRegExp } from '@stlmpp/utils';
import { createFakeControl } from '../util-tests';

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
    expect(val.reg).toBeDefined();
    // @ts-ignore
    expect(isRegExp(val.reg)).toBeTrue();
  });

  it('should not validate if value is falsey', () => {
    expect(validator.validate(createFakeControl(''))).toBeNull();
  });

  it('should return null if value matchs the pattern', () => {
    expect(validator.validate(createFakeControl('GUI'))).toBeNull();
  });

  it('should return error if value does not match the pattern', () => {
    expect(validator.validate(createFakeControl('G'))).toEqual({ expected: '^GUI$', actual: 'G' });
  });
});
