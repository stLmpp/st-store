import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../../st-control.module';
import { By } from '@angular/platform-browser';
import { ModelDirective } from '../../model/model.directive';
import { triggerEvent } from '../../util-tests';

@Component({
  template: `
    <input type="number" [model]="model" #model1="model" [between]="between" />
    <input
      type="number"
      [model]="model"
      #model2="model"
      between
      [betweenStart]="betweenStart"
      [betweenEnd]="betweenEnd"
    />
    <input
      type="number"
      [model]="model"
      #model3="model"
      [between]="between"
      [betweenInclusiveness]="betweenInclusiveness"
    />
  `,
})
class ModelComponent {
  @ViewChild('model1') modelDirective!: ModelDirective;
  @ViewChild('model2') modelDirective2!: ModelDirective;
  @ViewChild('model3') modelDirective3!: ModelDirective;
  model = 1;
  between: { start: number; end: number } | [number, number] = [1, 2];
  betweenStart = 1;
  betweenEnd = 2;
  betweenInclusiveness = [true, true];
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

  describe('should rerun validator when @Input() changes', () => {
    it('between', () => {
      component.between = { start: 2, end: 3 };
      fixture.detectChanges();
      expect(component.modelDirective.isValid).toBeFalse();
    });

    it('betweenStart', () => {
      expect(component.modelDirective2.isValid).toBeTrue();
      component.betweenStart = 2;
      fixture.detectChanges();
      expect(component.modelDirective2.isValid).toBeFalse();
    });

    it('betweenEnd', () => {
      component.model = 5;
      fixture.detectChanges();
      expect(component.modelDirective2.isValid).toBeFalse();
      component.betweenEnd = 5;
      fixture.detectChanges();
      expect(component.modelDirective2.isValid).toBeTrue();
    });

    it('betweenInclusiveness', () => {
      component.betweenInclusiveness = [false, true];
      fixture.detectChanges();
      expect(component.modelDirective3.isValid).toBeFalse();
    });
  });
});
