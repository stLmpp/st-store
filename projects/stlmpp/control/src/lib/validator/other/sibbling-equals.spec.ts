import { Component } from '@angular/core';
import { Control } from '../../control/control';
import { ControlGroup } from '../../control-group/control-group';
import { Validators } from '../validators';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../../st-control.module';

@Component({ template: `<input [control]="control" />` })
class WithoutParent {
  control = new Control('', [Validators.siblingEquals('sibling')]);
}

@Component({
  template: ` <div [controlGroup]="controlGroup">
    <input controlName="control" />
  </div>`,
})
class WithoutSibling {
  controlGroup = new ControlGroup<{ control: string }>({
    control: new Control('A', [Validators.siblingEquals('sibling')]),
  });
}

@Component({
  template: ` <div [controlGroup]="controlGroup">
    <input controlName="control" />
    <div controlGroupName="sibling"></div>
  </div>`,
})
class SiblingNotControl {
  controlGroup = new ControlGroup<{ control: string; sibling: object }>({
    control: new Control('A', [Validators.siblingEquals('sibling')]),
    sibling: new ControlGroup({}),
  });
}

@Component({
  template: `
    <div [controlGroup]="controlGroup">
      <input controlName="control" />
      <input controlName="sibling" />
    </div>
  `,
})
class ControlComponent {
  controlGroup = new ControlGroup<{ control: string; sibling: string }>({
    control: new Control('A', [Validators.siblingEquals('sibling')]),
    sibling: new Control('B', [Validators.siblingEquals('control')]),
  });
}

describe('sibling equals validator', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [WithoutParent, WithoutSibling, SiblingNotControl, ControlComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should return null if control has no parent', async () => {
    const fix = TestBed.createComponent(WithoutParent);
    fix.detectChanges();
    expect(fix.componentInstance.control.getError('siblingEquals')).toBeUndefined();
  });

  it('should return null if sibling does not exists', () => {
    const fix = TestBed.createComponent(WithoutSibling);
    fix.detectChanges();
    expect(fix.componentInstance.controlGroup.get('control').getError('siblingEquals')).toBeUndefined();
  });

  it('should return null if sibling is not a control', () => {
    const fix = TestBed.createComponent(SiblingNotControl);
    fix.detectChanges();
    expect(fix.componentInstance.controlGroup.get('control').getError('siblingEquals')).toBeUndefined();
  });

  it('should return error if siblings are different', () => {
    expect(component.controlGroup.get('control').getError('siblingEquals')).toEqual({ value: 'A', sibling: 'B' });
    expect(component.controlGroup.get('sibling').getError('siblingEquals')).toEqual({ value: 'B', sibling: 'A' });
  });

  it('should return null if siblings are equal', () => {
    component.controlGroup.get('control').setValue('B');
    fixture.detectChanges();
    expect(component.controlGroup.get('control').getError('siblingEquals')).toBeUndefined();
    expect(component.controlGroup.get('sibling').getError('siblingEquals')).toBeUndefined();
  });
});
