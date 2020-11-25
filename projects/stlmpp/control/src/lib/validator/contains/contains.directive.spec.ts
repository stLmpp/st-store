import { Component, DebugElement, ViewChild } from '@angular/core';
import { ModelDirective } from '../../model/model.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../../st-control.module';
import { By } from '@angular/platform-browser';

@Component({ template: '<input [(model)]="model" contains="a">' })
class ModelComponent {
  @ViewChild(ModelDirective) modelDirective!: ModelDirective;
  model = 'teste';
}

describe('contains validator directive', () => {
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

  it('should validate if contains', () => {
    expect(component.modelDirective.isValid).toBeFalse();
    component.model = 'a';
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });
});
