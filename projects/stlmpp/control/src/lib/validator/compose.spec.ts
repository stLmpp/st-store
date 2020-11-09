import { Component, DebugElement } from '@angular/core';
import { Control } from '../control/control';
import { Validators } from './validators';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { ContainsValidator } from './contains';

class ContainsWithClass extends ContainsValidator {
  classes = ['contains'];
}

@Component({ template: `<input [control]="control" />` })
class ControlComponent {
  control = new Control(
    'T',
    Validators.compose(Validators.required, Validators.minLength(3), new ContainsWithClass('A'))
  );
}

describe('compose validator', () => {
  let component: ControlComponent;
  let fixture: ComponentFixture<ControlComponent>;
  let input: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('input'));
  });

  it('should set the combined attributes of composed validators', () => {
    expect(input.attributes.required).toBeDefined();
    expect(input.attributes['aria-required']).toBeDefined();
    expect(input.attributes.minlength).toBeDefined();
  });

  it('should set the combined classes of composed validators', () => {
    expect(input.nativeElement).toHaveClass('contains');
  });

  it('should return an object with the composed errors', () => {
    expect(component.control.getError('compose')).toEqual({ minLength: { actual: 1, required: 3 }, contains: true });
  });

  it('should return null if none of composed validators return errors', () => {
    component.control.setValue('AAA');
    fixture.detectChanges();
    expect(component.control.getError('compose')).toBeUndefined();
  });
});
