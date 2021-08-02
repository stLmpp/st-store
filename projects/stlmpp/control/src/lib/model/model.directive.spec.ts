import { Component, DebugElement, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ModelDirective } from './model.directive';
import { triggerEvent } from '../util-tests';
import { ControlUpdateOn } from '../control-update-on';
import { StControlModelModule } from '../st-control-model.module';

@Component({
  template: `
    <input class="input1" [(model)]="model" required #input1="model" [modelMetadata]="metadata" />
    <input class="input2" [(model)]="model" #input2="model" />
    <input class="input3" [(model)]="model" #input3="model" [modelUpdateOn]="updateOn" />
  `,
})
class ModelComponent {
  @ViewChild('input1') input1Directive!: ModelDirective;
  @ViewChild('input2') input2Directive!: ModelDirective;
  @ViewChild('input3') input3Directive!: ModelDirective;
  model = 'test';
  updateOn: ControlUpdateOn = 'blur';
  metadata = 'metadata';
}

describe('StModel Directive', () => {
  let fixture: ComponentFixture<ModelComponent>;
  let component: ModelComponent;
  let input1: DebugElement;
  let input2: DebugElement;
  let input3: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModelModule],
      declarations: [ModelComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ModelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    input1 = fixture.debugElement.query(By.css('.input1'));
    input2 = fixture.debugElement.query(By.css('.input2'));
    input3 = fixture.debugElement.query(By.css('.input3'));
  });

  it('should initialize input with value', () => {
    expect(input1.nativeElement.value).toBe('test');
  });

  it('should add validators', () => {
    expect(component.input1Directive.control.validators.includes('required')).toBeTrue();
    expect(component.input2Directive.control.validators.length).toBe(0);
  });

  it('should update the view with the value from the controller', () => {
    component.model = 'test2';
    fixture.detectChanges();
    expect(input1.nativeElement.value).toBe('test2');
  });

  it('should update the controller with the value from the view', () => {
    triggerEvent(input1, 'input', 'test3');
    triggerEvent(input1, 'blur');
    fixture.detectChanges();
    expect(component.model).toBe('test3');
  });

  it('should set updateOn option', () => {
    triggerEvent(input3, 'input', 'test3');
    fixture.detectChanges();
    expect(component.model).toBe('test');
    triggerEvent(input3, 'blur');
    fixture.detectChanges();
    expect(component.model).toBe('test3');
  });

  it('should be able to change updateOn', () => {
    component.updateOn = 'change';
    fixture.detectChanges();
    triggerEvent(input3, 'input', 'test3');
    fixture.detectChanges();
    expect(component.model).toBe('test3');
  });

  it('should store metadata', () => {
    expect(component.input1Directive.control.metadata).toBe(component.metadata);
    component.metadata = 'test';
    fixture.detectChanges();
    expect(component.input1Directive.control.metadata).toBe('test');
  });
});
