import { Component, DebugElement, ViewChild } from '@angular/core';
import { ModelDirective } from '../../model/model.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StControlModelModule } from '../../st-control-model.module';

@Component({ template: '<input type="email" [(model)]="model" [required]="required">' })
class ModelComponent {
  @ViewChild(ModelDirective) modelDirective!: ModelDirective;
  model = '';
  required = true;
}

describe('required validator directive', () => {
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

  it('should validated if value is empty', () => {
    expect(component.modelDirective.isValid).toBeFalse();
    component.model = 'gui.stlmpp@hotmail.com';
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });

  it('should remove the attribute if required directive receives false', () => {
    component.required = false;
    fixture.detectChanges();
    expect(input.attributes.required).toBeUndefined();
    expect(input.attributes['aria-required']).toBe('false');
    component.model = '1';
    fixture.detectChanges();
    component.model = '';
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });

  it('should rerun the validator if the required @Input() required changes', () => {
    component.required = false;
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });
});
