import { Component } from '@angular/core';
import { Control } from '../control/control';
import { Validators } from './validators';
import { TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { createFakeControl } from '../util-tests';
import { MinValidator } from './min';

@Component({
  template:
    '<input class="input-number" type="number" [control]="control"><input class="input-date" type="date" [control]="controlDate">',
})
class ControlComponent {
  control = new Control<number>(0, [Validators.min<number>(5)]);
  controlDate = new Control<Date>(null, [Validators.min(new Date(2020, 1, 14))]);
}

describe('min validator', () => {
  let valNumber: MinValidator<number>;
  let valDate: MinValidator<Date>;

  beforeEach(() => {
    valNumber = new MinValidator<number>(5);
    valDate = new MinValidator<Date>(new Date(2020, 1, 14));
  });

  it('should add the min attribute', async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent],
    }).compileComponents();
    const fix = TestBed.createComponent(ControlComponent);
    fix.detectChanges();
    expect(fix.debugElement.query(By.css('.input-number')).attributes.min).toBe('5');
    expect(fix.debugElement.query(By.css('.input-date')).attributes.min).toBe('2020-02-14');
  });

  describe('number', () => {
    it('should return null if number is greater or equal to min', () => {
      expect(valNumber.validate(createFakeControl(5))).toBeNull();
    });

    it('should return error if number is lower than min', () => {
      expect(valNumber.validate(createFakeControl(4))).toEqual({ actual: 4, required: 5 });
    });
  });

  describe('date', () => {
    it('should return null if date is greater or equal than min', () => {
      expect(valDate.validate(createFakeControl(new Date(2020, 1, 15)))).toBeNull();
      expect(valDate.validate(createFakeControl('2020-02-14' as any))).toBeNull();
    });

    it('should return error is date is lower than min', () => {
      expect(valDate.validate(createFakeControl(new Date(2020, 1, 13)))).toEqual({
        actual: new Date(2020, 1, 13),
        required: new Date(2020, 1, 14),
      });
    });

    it('should accept string on date validator', () => {
      const val = new MinValidator<Date>('2020-02-14');
      expect(val.validate(createFakeControl(new Date(2020, 1, 15)))).toBeNull();
    });
  });
});
