import { Component, Input, ViewChild } from '@angular/core';
import { ControlGroup } from '../control-group';
import { Control } from './control';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { ControlNameDirective } from './control-name.directive';

@Component({
  template:
    '<div [controlGroup]="controlGroup"><input [controlName]="controlName" #controlNameRef="controlName"></div>',
})
class ControlComponent {
  @ViewChild('controlNameRef') controlNameDirective!: ControlNameDirective;
  @Input() controlGroup = new ControlGroup({ control: new Control(1), control2: new Control(2) });
  @Input() controlName = 'control';
}

@Component({ template: '<input controlName="not exists">' })
class ControlWithoutParent {}

@Component({ template: '<div [controlGroup]="controlGroup"><input controlName="notControl"></div>' })
class ControlNameNotControl {
  controlGroup = new ControlGroup({ notControl: new ControlGroup({}) });
}

describe('control name', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent, ControlWithoutParent, ControlNameNotControl],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should change control if control name change', () => {
    expect(component.controlNameDirective.control.value).toBe(1);
    component.controlName = 'control2';
    fixture.detectChanges();
    expect(component.controlNameDirective.control.value).toBe(2);
  });

  it('should throw if control name is not found', () => {
    expect(() => {
      component.controlName = 'not exists';
      fixture.detectChanges();
    }).toThrow();
  });

  it('should throw if control parent is not found', () => {
    expect(() => {
      TestBed.createComponent(ControlWithoutParent).detectChanges();
    }).toThrow();
  });

  it('should throw if controlName is not a control', () => {
    expect(() => {
      TestBed.createComponent(ControlNameNotControl).detectChanges();
    }).toThrow();
  });
});
