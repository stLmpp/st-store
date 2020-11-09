import { Component, DebugElement } from '@angular/core';
import { Control } from '../control';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { triggerEvent } from '../util-tests';

@Component({
  template: `
    <input class="radio-1" type="radio" name="radio" [value]="1" [control]="control" />
    <input class="radio-2" type="radio" name="radio" [value]="2" [control]="control" />
  `,
})
class ControlComponent {
  control = new Control(1);
}

describe('control value radio standalone', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;
  let radio1: DebugElement;
  let radio2: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    radio1 = fixture.debugElement.query(By.css('.radio-1'));
    radio2 = fixture.debugElement.query(By.css('.radio-2'));
  });

  it('should start with value', () => {
    expect(radio1.nativeElement.checked).toBeTrue();
  });

  it('should trigger onChange$', () => {
    triggerEvent(radio2, 'change', true, 'checked');
    triggerEvent(radio2, 'blur');
    fixture.detectChanges();
    expect(component.control.value).toBe(2);
  });

  it('should not trigger onChange$', () => {
    triggerEvent(radio2, 'change', false, 'checked');
    triggerEvent(radio2, 'blur');
    fixture.detectChanges();
    expect(component.control.value).toBe(1);
  });
});
