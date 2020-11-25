import { Component, DebugElement, ViewChild } from '@angular/core';
import { ModelDirective } from '../../model/model.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../../st-control.module';
import { By } from '@angular/platform-browser';

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
      imports: [StControlModule],
      declarations: [ModelComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('input'));
  });

  it('should validate if value is an url', () => {
    expect(component.modelDirective.isValid).toBeFalse();
    component.model = 'http://www.google.com/';
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });

  it('should remove the attribute if url directive receives false', () => {
    component.url = false;
    fixture.detectChanges();
    expect(input.attributes.url).toBeUndefined();
    component.model = 'testas';
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });
});
