import { Component } from '@angular/core';
import { Control } from '../control';
import { Validators } from './validators';
import { TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { createFakeControl } from '../util-tests';
import { MaxLengthValidator } from './max-length';

@Component({ template: '<input [control]="control">' })
class ControlComponent {
  control = new Control('', [Validators.maxLength(3)]);
}

describe('max length validator', () => {
  let valString: MaxLengthValidator<string>;
  let valArray: MaxLengthValidator<string[]>;

  beforeEach(() => {
    valString = new MaxLengthValidator<string>(3);
    valArray = new MaxLengthValidator<string[]>(3);
  });

  it('should apply the attribute of max length', async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(ControlComponent);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('input')).attributes.maxlength).toBe('3');
  });

  it('should not validate if value is null or undefined', () => {
    expect(valString.validate(createFakeControl(null as any))).toBeNull();
    expect(valArray.validate(createFakeControl(null as any))).toBeNull();
  });

  describe('string', () => {
    it('should return null if string length is lesser or equal than maxlength', () => {
      expect(valString.validate(createFakeControl('AA'))).toBeNull();
    });

    it('should return error if string length is greater than maxlength', () => {
      expect(valString.validate(createFakeControl('AAAA'))).toEqual({ required: 3, actual: 4 });
    });
  });

  describe('array', () => {
    it('should return null if array length is lesser or equal than maxlength', () => {
      expect(valArray.validate(createFakeControl(['A', 'A']))).toBeNull();
    });

    it('should return error if array length is greater than maxlength', () => {
      expect(valArray.validate(createFakeControl(['A', 'A', 'A', 'A']))).toEqual({ required: 3, actual: 4 });
    });
  });
});
