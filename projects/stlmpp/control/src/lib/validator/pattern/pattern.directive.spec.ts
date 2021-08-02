import { Component, DebugElement, ViewChild } from '@angular/core';
import { ModelDirective } from '../../model/model.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StControlModelModule } from '../../st-control-model.module';

@Component({ template: '<input type="text" [(model)]="model" [pattern]="pattern">' })
class ModelComponent {
  @ViewChild(ModelDirective) modelDirective!: ModelDirective;
  model = 'test';

  pattern = '^GUI$';
}

describe('pattern validator directive', () => {
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

  it('should validate if value is valid in the pattern', () => {
    expect(component.modelDirective.isValid).toBeFalse();
    component.model = 'GUI';
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });

  it('should rerun the validator if the pattern changes', () => {
    component.pattern = '^test$';
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });
});
