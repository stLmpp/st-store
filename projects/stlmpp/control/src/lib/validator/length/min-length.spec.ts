import { Component } from '@angular/core';
import { Control } from '../../control/control';
import { Validators } from '../validators';
import { TestBed } from '@angular/core/testing';
import { StControlModule } from '../../st-control.module';
import { By } from '@angular/platform-browser';
import { createFakeControl } from '../../util-tests';
import { MinLengthValidator } from './min-length';

@Component({ template: '<input [control]="control">' })
class ControlComponent {
  control = new Control('', [Validators.minLength(3)]);
}

describe('min length validator', () => {
  let valString: MinLengthValidator<string>;
  let valArray: MinLengthValidator<string[]>;

  beforeEach(() => {
    valString = new MinLengthValidator<string>(3);
    valArray = new MinLengthValidator<string[]>(3);
  });

  it('should apply the attribute of min length', async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent],
    }).compileComponents();
    const fixture = TestBed.createComponent(ControlComponent);
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('input')).attributes.minlength).toBe('3');
  });

  it('should not validate if value is null or undefined', () => {
    expect(valString.validate(createFakeControl(null as any))).toBeNull();
    expect(valArray.validate(createFakeControl(null as any))).toBeNull();
  });

  describe('string', () => {
    it('should return null if string length is greater or equal than minlength', () => {
      expect(valString.validate(createFakeControl('AAAA'))).toBeNull();
    });

    it('should return error if string length is lesser than minlength', () => {
      expect(valString.validate(createFakeControl('AA'))).toEqual({ required: 3, actual: 2 });
    });
  });

  describe('array', () => {
    it('should return null if array length is greater or equal than minlength', () => {
      expect(valArray.validate(createFakeControl(['A', 'A', 'A', 'A']))).toBeNull();
    });

    it('should return error if array length is lesser than minlength', () => {
      expect(valArray.validate(createFakeControl(['A', 'A']))).toEqual({ required: 3, actual: 2 });
    });
  });
});
