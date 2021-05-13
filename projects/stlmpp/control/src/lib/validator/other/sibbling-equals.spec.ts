import { Component } from '@angular/core';
import { Control } from '../../control/control';
import { ControlGroup } from '../../control-group/control-group';
import { Validators } from '../validators';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../../st-control.module';

@Component({ template: `<input [control]="control" />` })
class WithoutParent {
  control = new Control('', [Validators.sibblingEquals('sibbling')]);
}

@Component({
  template: ` <div [controlGroup]="controlGroup">
    <input controlName="control" />
  </div>`,
})
class WithoutSibbling {
  controlGroup = new ControlGroup<{ control: string }>({
    control: new Control('A', [Validators.sibblingEquals('sibbling')]),
  });
}

@Component({
  template: ` <div [controlGroup]="controlGroup">
    <input controlName="control" />
    <div controlGroupName="sibbling"></div>
  </div>`,
})
class SibblingNotControl {
  controlGroup = new ControlGroup<{ control: string; sibbling: object }>({
    control: new Control('A', [Validators.sibblingEquals('sibbling')]),
    sibbling: new ControlGroup({}),
  });
}

@Component({
  template: `
    <div [controlGroup]="controlGroup">
      <input controlName="control" />
      <input controlName="sibbling" />
    </div>
  `,
})
class ControlComponent {
  controlGroup = new ControlGroup<{ control: string; sibbling: string }>({
    control: new Control('A', [Validators.sibblingEquals('sibbling')]),
    sibbling: new Control('B', [Validators.sibblingEquals('control')]),
  });
}

describe('sibbling equals validator', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [WithoutParent, WithoutSibbling, SibblingNotControl, ControlComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should return null if control has no parent', async () => {
    const fix = TestBed.createComponent(WithoutParent);
    fix.detectChanges();
    expect(fix.componentInstance.control.getError('sibblingEquals')).toBeUndefined();
  });

  it('should return null if sibbling does not exists', () => {
    const fix = TestBed.createComponent(WithoutSibbling);
    fix.detectChanges();
    expect(fix.componentInstance.controlGroup.get('control').getError('sibblingEquals')).toBeUndefined();
  });

  it('should return null if sibbling is not a control', () => {
    const fix = TestBed.createComponent(SibblingNotControl);
    fix.detectChanges();
    expect(fix.componentInstance.controlGroup.get('control').getError('sibblingEquals')).toBeUndefined();
  });

  it('should return error if sibblings are different', () => {
    expect(component.controlGroup.get('control').getError('sibblingEquals')).toEqual({ value: 'A', sibbling: 'B' });
    expect(component.controlGroup.get('sibbling').getError('sibblingEquals')).toEqual({ value: 'B', sibbling: 'A' });
  });

  it('should return null if sibblings are equal', () => {
    component.controlGroup.get('control').setValue('B');
    fixture.detectChanges();
    expect(component.controlGroup.get('control').getError('sibblingEquals')).toBeUndefined();
    expect(component.controlGroup.get('sibbling').getError('sibblingEquals')).toBeUndefined();
  });
});
