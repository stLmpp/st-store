import { Component, DebugElement } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { triggerEvent } from '../util-tests';
import { Control } from '../control/control';

@Component({
  template: `
    <input type="week" [control]="controlWeek" />
    <input type="time" [control]="controlTime" />
    <input type="month" [control]="controlMonth" />
    <input type="date" [control]="controlDate" />
    <input type="datetime-local" [control]="controlDatetime" />
  `,
})
class ControlComponent {
  controlDate = new Control<Date | null>(null);
  controlWeek = new Control<string | null>(null);
  controlTime = new Control<string | null>(null, { initialFocus: true });
  controlMonth = new Control<Date | null>(null);
  controlDatetime = new Control<Date | null>(null);
}

@Component({
  template: `
    <input type="week" [(model)]="modelWeek" />
    <input type="time" [(model)]="modelTime" />
    <input type="month" [(model)]="modelMonth" />
    <input type="date" [(model)]="modelDate" />
    <input type="datetime-local" [(model)]="modelDatetime" />
  `,
})
class ModelComponent {
  modelWeek = null;
  modelTime = null;
  modelMonth = null;
  modelDate = null;
  modelDatetime = null;
}

describe('control value date', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent, ModelComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should work with model', () => {
    expect(() => {
      TestBed.createComponent(ModelComponent).detectChanges();
    }).not.toThrow();
  });

  it('should start with focus', () => {
    const input = fixture.debugElement.query(By.css('input[type=time]')).nativeElement;
    expect(input).toBe(document.activeElement);
  });

  describe('date', () => {
    let input: DebugElement;

    beforeEach(() => {
      input = fixture.debugElement.query(By.css('input[type=date]'));
    });

    it('should convert the value to date', () => {
      triggerEvent(input, 'input', '2020-02-14');
      triggerEvent(input, 'blur');
      fixture.detectChanges();
      expect(new Date(2020, 1, 14)).toEqual(component.controlDate.value!);
    });

    it('should set null if value is not a date', () => {
      triggerEvent(input, 'input', '');
      triggerEvent(input, 'blur');
      fixture.detectChanges();
      expect(component.controlDate.value).toBeNull();
    });

    it('should set the input value as string', () => {
      component.controlDate.setValue(new Date(2020, 1, 14));
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('2020-02-14');
      component.controlDate.setValue('2020-03-14' as any);
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('2020-03-14');
      component.controlDate.setValue(new Date(2020, 3, 14).toISOString() as any);
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('2020-04-14');
    });

    it('should not set the input value is invalid date', () => {
      component.controlDate.setValue('2014-55-26' as any);
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('');
    });
  });

  describe('month', () => {
    let input: DebugElement;

    beforeEach(() => {
      input = fixture.debugElement.query(By.css('input[type=month]'));
    });

    it('should convert the value to date', () => {
      triggerEvent(input, 'input', '2020-02');
      triggerEvent(input, 'blur');
      fixture.detectChanges();
      expect(new Date(2020, 1)).toEqual(component.controlMonth.value!);
    });

    it('should set null if value is not a date', () => {
      triggerEvent(input, 'input', '');
      triggerEvent(input, 'blur');
      fixture.detectChanges();
      expect(component.controlMonth.value).toBeNull();
    });

    it('should set the input value as string', () => {
      component.controlMonth.setValue(new Date(2020, 1));
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('2020-02');
      component.controlMonth.setValue('2020-03' as any);
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('2020-03');
      component.controlMonth.setValue(new Date(2020, 3).toISOString() as any);
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('2020-04');
    });

    it('should not set the input value is invalid date', () => {
      component.controlMonth.setValue('2014-55-26' as any);
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('');
    });
  });

  describe('time', () => {
    let input: DebugElement;

    beforeEach(() => {
      input = fixture.debugElement.query(By.css('input[type=time]'));
    });

    it('should set the value', () => {
      triggerEvent(input, 'input', '11:11');
      triggerEvent(input, 'blur');
      fixture.detectChanges();
      expect(component.controlTime.value).toBe('11:11');
    });

    it('should set the value on input', () => {
      component.controlTime.setValue('11:11');
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('11:11');
    });

    it('should not set invalid value on input', () => {
      component.controlTime.setValue('');
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('');
      component.controlTime.setValue('25:00');
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('');
      component.controlTime.setValue('11:61');
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('');
    });
  });

  describe('week', () => {
    let input: DebugElement;

    beforeEach(() => {
      input = fixture.debugElement.query(By.css('input[type=week]'));
    });

    it('should set the value', () => {
      triggerEvent(input, 'input', '2020-W14');
      triggerEvent(input, 'blur');
      fixture.detectChanges();
      expect(component.controlWeek.value).toBe('2020-W14');
    });

    it('should set the value of input', () => {
      component.controlWeek.setValue('2020-W14');
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('2020-W14');
    });

    it('should not set the value if format is invalid', () => {
      component.controlWeek.setValue('E2020-W24');
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('');
      component.controlWeek.setValue('2020-W55');
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('');
      component.controlWeek.setValue('2020-W-1');
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('');
      component.controlWeek.setValue('99999999999999999999999999-W01');
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('');
    });
  });

  describe('datetime-local', () => {
    let input: DebugElement;

    beforeEach(() => {
      input = fixture.debugElement.query(By.css('input[type=datetime-local]'));
    });

    it('should convert the value to date', () => {
      triggerEvent(input, 'input', '2020-02-14T23:59');
      triggerEvent(input, 'blur');
      fixture.detectChanges();
      expect(new Date(2020, 1, 14, 23, 59)).toEqual(component.controlDatetime.value!);
    });

    it('should set null if value is not a date', () => {
      triggerEvent(input, 'input', '');
      triggerEvent(input, 'blur');
      fixture.detectChanges();
      expect(component.controlDatetime.value).toBeNull();
      triggerEvent(input, 'input', '2022-04-56T23:49');
      triggerEvent(input, 'blur');
      fixture.detectChanges();
      expect(component.controlDatetime.value).toBeNull();
    });

    it('should set the input value as string', () => {
      component.controlDatetime.setValue(new Date(2020, 1, 14, 23, 59));
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('2020-02-14T23:59');
      component.controlDatetime.setValue('2020-03-14T23:58' as any);
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('2020-03-14T23:58');
      component.controlDatetime.setValue(new Date(2020, 3, 14, 23, 57).toISOString() as any);
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('2020-04-14T23:57');
    });

    it('should not set the input value is invalid date', () => {
      component.controlDatetime.setValue('2014-55-26' as any);
      fixture.detectChanges();
      expect(input.nativeElement.value).toBe('');
    });

    it('should set the value of the control to null if invalid date', () => {
      input.triggerEventHandler('input', { target: { value: 'TEST' } });
      fixture.detectChanges();
      expect(component.controlDatetime.value).toBeNull();
    });
  });
});
