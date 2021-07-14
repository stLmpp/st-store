import { Component, DebugElement, ViewChild } from '@angular/core';
import { ModelDirective } from '../../model/model.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../../st-control.module';
import { By } from '@angular/platform-browser';

@Component({ template: '<input type="text" [(model)]="model" [minLength]="minLength">' })
class ModelComponent {
  @ViewChild(ModelDirective) modelDirective!: ModelDirective;
  model = 'test';
  minLength = 5;
}

describe('min-length validator directive', () => {
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

  it('should validate if value is in range', () => {
    expect(component.modelDirective.isValid).toBeFalse();
    component.model = 'test test test ';
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });

  it('should rerun validator when @Input() minLength changes', () => {
    component.minLength = 4;
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });
});
