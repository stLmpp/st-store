import { Component, DebugElement, ViewChild } from '@angular/core';
import { ModelDirective } from '../../model/model.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../../st-control.module';
import { By } from '@angular/platform-browser';

@Component({ template: '<input [(model)]="model" [contains]="contains">' })
class ModelComponent {
  @ViewChild(ModelDirective) modelDirective!: ModelDirective;
  model = 'teste';
  contains = 'a';
}

@Component({ template: '<input [(model)]="model" [contains]="contains" [compareWith]="compareWith">' })
class ModelArrayComponent {
  @ViewChild(ModelDirective) modelDirective!: ModelDirective;
  model = [{ id: 1 }, { id: 2 }, { id: 3 }];
  contains = 1;
  compareWith = Object.is;
}

describe('contains validator directive', () => {
  let fixture: ComponentFixture<ModelComponent>;
  let component: ModelComponent;
  let input: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ModelComponent, ModelArrayComponent],
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

  it('should rerun validator if @Input() contains changes', () => {
    component.contains = 'e';
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });

  it('should rerun validator if @Input() compareWith changes', () => {
    const fix = TestBed.createComponent(ModelArrayComponent);
    fix.detectChanges();
    expect(fix.componentInstance.modelDirective.isValid).toBeFalse();
    fix.componentInstance.compareWith = (valueA, valueB) => valueA.id === valueB;
    fix.detectChanges();
    expect(fix.componentInstance.modelDirective.isValid).toBeTrue();
  });
});
