import { Component, DebugElement, ViewChild } from '@angular/core';
import { ModelDirective } from '../../model/model.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StControlModelModule } from '../../st-control-model.module';

@Component({ template: '<input type="url" [(model)]="model" [url]="url">' })
class ModelComponent {
  @ViewChild(ModelDirective) modelDirective!: ModelDirective;
  model = 'gui';
  url = true;
}

describe('url validator directive', () => {
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

  it('should validate if value is an url', () => {
    expect(component.modelDirective.isValid).toBeFalse();
    component.model = 'https://www.google.com/';
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });

  it('should remove the attribute if url directive receives false', () => {
    component.url = false;
    fixture.detectChanges();
    expect(input.attributes.url).toBeUndefined();
    component.model = 'test as';
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });

  it('should rerun the validator if the @Input() url changes', () => {
    component.url = false;
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });
});
