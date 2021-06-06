import { Component, DebugElement, ViewChild } from '@angular/core';
import { ModelDirective } from '../../model/model.directive';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../../st-control.module';
import { By } from '@angular/platform-browser';

@Component({ template: '<input type="email" [(model)]="model" [email]="email">' })
class ModelComponent {
  @ViewChild(ModelDirective) modelDirective!: ModelDirective;
  model = 'gui';
  email = true;
}

describe('email validator directive', () => {
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

  it('should validate if value is an e-mail', () => {
    expect(component.modelDirective.isValid).toBeFalse();
    component.model = 'gui.stlmpp@hotmail.com';
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });

  it('should remove the attribute if email directive receives false', () => {
    component.email = false;
    fixture.detectChanges();
    expect(input.attributes.email).toBeUndefined();
    component.model = 'gui.stlmpp';
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });

  it('should rerun the validator when the @Input() email changes', () => {
    component.email = false;
    fixture.detectChanges();
    expect(component.modelDirective.isValid).toBeTrue();
  });
});
