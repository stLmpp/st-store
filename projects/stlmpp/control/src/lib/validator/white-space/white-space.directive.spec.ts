import { Component, DebugElement, ViewChild } from '@angular/core';
import { ModelDirective } from '../../model/model.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../../st-control.module';
import { By } from '@angular/platform-browser';
import { WhiteSpaceValidatorDirective } from './white-space.directive';

@Component({ template: '<input type="text" [(model)]="model" [whiteSpace]="whiteSpace">' })
class ModelComponent {
  @ViewChild(ModelDirective) modelDirective!: ModelDirective;
  @ViewChild(WhiteSpaceValidatorDirective) whiteSpaceValidatorDirective!: WhiteSpaceValidatorDirective;

  model = '';
  whiteSpace = true;
}

describe('white space validator directive', () => {
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

  it('should validate if value is white space', () => {
    expect(component.modelDirective.isValid).toBeTrue();
    component.model = '     ';
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeFalse();
    component.model = 'TEST';
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });

  it('should not validate if input is set to false', () => {
    component.whiteSpace = false;
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });

  it('should get the white space input', () => {
    expect(component.whiteSpaceValidatorDirective.whiteSpace).toBeTrue();
  });
});
