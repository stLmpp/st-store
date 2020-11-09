import { MaxValidator } from './max';
import { Component } from '@angular/core';
import { Control } from '../control';
import { Validators } from './validators';
import { TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { createFakeControl } from '../util-tests';

@Component({
  template:
    '<input class="input-number" type="number" [control]="control"><input class="input-date" type="date" [control]="controlDate">',
})
class ControlComponent {
  control = new Control<number>(0, [Validators.max<number>(5)]);
  controlDate = new Control<Date>(null, [Validators.max(new Date(2020, 1, 14))]);
}

describe('max validator', () => {
  let valNumber: MaxValidator<number>;
  let valDate: MaxValidator<Date>;

  beforeEach(() => {
    valNumber = new MaxValidator<number>(5);
    valDate = new MaxValidator<Date>(new Date(2020, 1, 14));
  });

  it('should add the max attribute', async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent],
    }).compileComponents();
    const fix = TestBed.createComponent(ControlComponent);
    fix.detectChanges();
    expect(fix.debugElement.query(By.css('.input-number')).attributes.max).toBe('5');
    expect(fix.debugElement.query(By.css('.input-date')).attributes.max).toBe('2020-02-14');
  });

  describe('number', () => {
    it('should return null if number is lower or equal than max', () => {
      expect(valNumber.validate(createFakeControl(5))).toBeNull();
    });

    it('should return error if number is greater than max', () => {
      expect(valNumber.validate(createFakeControl(6))).toEqual({ actual: 6, required: 5 });
    });
  });

  describe('date', () => {
    it('should return null if date is lower or equal than max', () => {
      expect(valDate.validate(createFakeControl(new Date(2020, 1, 13)))).toBeNull();
      expect(valDate.validate(createFakeControl('2020-02-14' as any))).toBeNull();
    });

    it('should return error is date is greater than max', () => {
      expect(valDate.validate(createFakeControl(new Date(2020, 1, 15)))).toEqual({
        actual: new Date(2020, 1, 15),
        required: new Date(2020, 1, 14),
      });
    });

    it('should accept string on date validator', () => {
      const val = new MaxValidator<Date>('2020-02-14');
      expect(val.validate(createFakeControl(new Date(2020, 1, 13)))).toBeNull();
    });
  });
});
