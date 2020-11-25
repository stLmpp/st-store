import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../../st-control.module';
import { By } from '@angular/platform-browser';
import { ModelDirective } from '../../model/model.directive';
import { triggerEvent } from '../../util-tests';

@Component({ template: '<input type="number" [model]="model" [between]="between">' })
class ModelComponent {
  @ViewChild(ModelDirective) modelDirective!: ModelDirective;
  model = 1;
  between: { start: number; end: number } | [number, number] = [1, 2];
}

describe('between validator directive', () => {
  let fixture: ComponentFixture<ModelComponent>;
  let component: ModelComponent;
  let input: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ModelComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('input'));
  });

  it('should validate if value is between (tupple)', () => {
    expect(component.modelDirective.isValid).toBeTrue();
    triggerEvent(input, 'input', 12);
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeFalse();
  });

  it('should validate is value is between (object)', () => {
    component.between = { start: 1, end: 2 };
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
    triggerEvent(input, 'input', 12);
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeFalse();
  });
});
