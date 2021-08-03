import { Component, DebugElement, ViewChild } from '@angular/core';
import { ModelDirective } from '../../model/model.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StControlModelModule } from '../../st-control-model.module';

@Component({ template: '<input type="number" [(model)]="model" [greater]="greater">' })
class ModelComponent {
  @ViewChild(ModelDirective) modelDirective!: ModelDirective;
  model = 5;
  greater = 4;
}

describe('greater validator directive', () => {
  let fixture: ComponentFixture<ModelComponent>;
  let component: ModelComponent;
  let input: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModelModule],
      declarations: [ModelComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('input'));
  });

  it('should validate if value is greater', () => {
    expect(component.modelDirective.isValid).toBeTrue();
    component.model = 2;
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeFalse();
  });

  it('should rerun validator when @Input() greater changes', () => {
    component.greater = 5;
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeFalse();
  });
});
