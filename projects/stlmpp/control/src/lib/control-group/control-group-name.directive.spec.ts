import { Component, Directive, Input, Self, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { ControlGroup } from './control-group';
import { ControlGroupNameDirective } from './control-group-name.directive';
import { Control } from '../control/control';
import { ControlNameDirective } from '../control/control-name.directive';
import { ControlGroupDirective } from './control-group.directive';

@Component({ template: '<div controlGroupName="not exists"></div>' })
class WithoutParent {}

@Component({ template: '<div [controlGroup]="controlGroup"><div controlGroupName="not exists"></div></div>' })
class WithoutChild {
  controlGroup = new ControlGroup({});
}

@Component({
  template: ` <div [controlGroup]="controlGroup">
    <div [controlGroupName]="controlGroupName" #groupRef="controlGroupName">
      <input controlName="control" />
    </div>
  </div>`,
})
class ChangeControlName {
  @ViewChild('groupRef') groupNameDirective!: ControlGroupNameDirective;
  @ViewChild(ControlNameDirective) controlNameDirective!: ControlNameDirective;

  @Input() controlGroupName = 'group1';

  controlGroup = new ControlGroup<{ group1: { control: string }; group2: { control: string } }>({
    group1: new ControlGroup({ control: new Control('') }),
    group2: new ControlGroup({ control: new Control('') }),
  });
}

@Component({ template: '<div [controlGroup]="controlGroup"><div controlGroupName="notGroup"></div></div>' })
class ControlGroupNameNotGroup {
  controlGroup = new ControlGroup({ notGroup: new Control('') });
}

@Directive({ selector: '[customDir]', exportAs: 'customDir' })
class CustomDirective {
  constructor(@Self() public controlGroupDirective: ControlGroupDirective) {}
}

@Component({
  template: ` <div [controlGroup]="controlGroup">
    <div controlGroupName="controlGroup" customDir #customDir="customDir">
      <input controlName="control" />
    </div>
  </div>`,
})
class CustomDirComponent {
  @ViewChild('customDir') customDirective!: CustomDirective;
  controlGroup = new ControlGroup<{ controlGroup: { control: string } }>({
    controlGroup: new ControlGroup({ control: new Control('') }),
  });
}

describe('control group name directive', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [
        WithoutParent,
        WithoutChild,
        ChangeControlName,
        ControlGroupNameNotGroup,
        CustomDirective,
        CustomDirComponent,
      ],
    }).compileComponents();
  });

  it('should throw if parent not found', () => {
    expect(() => {
      const fix = TestBed.createComponent(WithoutParent);
      fix.detectChanges();
    }).toThrow();
  });

  it('should throw if controlGroup is not found', () => {
    expect(() => {
      const fix = TestBed.createComponent(WithoutChild);
      fix.detectChanges();
    }).toThrow();
  });

  it('should get a new controlGroup if controlGroupName is changed', () => {
    const fix = TestBed.createComponent(ChangeControlName);
    const comp = fix.componentInstance;
    fix.detectChanges();
    const group = comp.groupNameDirective.control;
    comp.controlGroupName = 'group2';
    fix.detectChanges();
    expect(group).not.toBe(comp.groupNameDirective.control);
  });

  it('should throw if controlGroupName is not controlGroup', () => {
    expect(() => {
      TestBed.createComponent(ControlGroupNameNotGroup).detectChanges();
    }).toThrow();
  });

  it('should be a ControlParent', () => {
    const fix = TestBed.createComponent(ChangeControlName);
    fix.detectChanges();
    // @ts-ignore
    expect(fix.componentInstance.groupNameDirective).toBe(fix.componentInstance.controlNameDirective.controlParent);
  });

  it('should provide ControlGroupDirective', () => {
    const customInputFixture = TestBed.createComponent(CustomDirComponent);
    customInputFixture.detectChanges();
    expect(customInputFixture.componentInstance.customDirective.controlGroupDirective).toBeDefined();
    expect(customInputFixture.componentInstance.customDirective.controlGroupDirective).toBeInstanceOf(
      ControlGroupDirective
    );
  });
});
