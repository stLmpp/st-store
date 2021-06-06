import { Component, DebugElement, ViewChild } from '@angular/core';
import { ModelDirective } from '../../model/model.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../../st-control.module';
import { By } from '@angular/platform-browser';

@Component({ template: '<input type="checkbox" [(model)]="model" [requiredTrue]="required">' })
class ModelComponent {
  @ViewChild(ModelDirective) modelDirective!: ModelDirective;
  model = false;
  required = true;
}

describe('required-true validator directive', () => {
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

  it('should validated if value is true', () => {
    expect(component.modelDirective.isValid).toBeFalse();
    component.model = true;
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });

  it('should remove the attribute if required-true directive receives false', () => {
    component.required = false;
    fixture.detectChanges();
    expect(input.attributes.required).toBeUndefined();
    expect(input.attributes['aria-required']).toBe('false');
    component.model = true;
    fixture.detectChanges();
    component.model = false;
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });

  it('should rerun validator when @Input() requiredTrue changes', () => {
    component.required = false;
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });
});
