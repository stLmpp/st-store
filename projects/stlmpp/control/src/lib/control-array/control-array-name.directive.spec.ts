import { Component, ViewChild } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { ControlArray } from './control-array';
import { ControlArrayNameDirective } from './control-array-name.directive';
import { Control } from '../control/control';
import { ControlNameDirective } from '../control/control-name.directive';
import { ControlGroup } from '../control-group/control-group';

@Component({ template: '<div controlArrayName="not exists"></div>' })
class WithoutParent {}

@Component({ template: '<div [controlGroup]="controlGroup"><div controlArrayName="not exists"></div></div>' })
class ControlNotExists {
  controlGroup = new ControlGroup({});
}

@Component({ template: '<div [controlGroup]="controlGroup"><div controlArrayName="notArray"></div></div>' })
class ControlArrayNameNotArray {
  controlGroup = new ControlGroup({ notArray: new Control('') });
}

@Component({
  template: '<div [controlGroup]="controlGroup"><div controlArrayName="array"></div></div>',
})
class ControlComponent {
  @ViewChild(ControlArrayNameDirective) controlArrayNameDirective!: ControlArrayNameDirective;
  controlGroup = new ControlGroup<{ array: string[] }>({ array: new ControlArray([new Control('')]) });
}

@Component({
  template: `
    <div [controlGroup]="controlGroup">
      <div controlArrayName="array">
        <input [controlName]="0" />
      </div>
    </div>
  `,
})
class ControlArrayParent {
  @ViewChild(ControlNameDirective) controlNameDirective!: ControlNameDirective;
  @ViewChild(ControlArrayNameDirective) controlArrayNameDirective!: ControlArrayNameDirective;
  controlGroup = new ControlGroup<{ array: string[] }>({ array: new ControlArray([new Control('')]) });
}

describe('control array name directive', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [WithoutParent, ControlNotExists, ControlArrayNameNotArray, ControlComponent, ControlArrayParent],
    }).compileComponents();
  });

  it('should throw if parent not found', () => {
    expect(() => {
      TestBed.createComponent(WithoutParent).detectChanges();
    }).toThrow();
  });

  it('should throw if controlArrayName not found', () => {
    expect(() => {
      TestBed.createComponent(ControlNotExists).detectChanges();
    }).toThrow();
  });

  it('should throw if controlArrayName is not a controlArray', () => {
    expect(() => {
      TestBed.createComponent(ControlArrayNameNotArray).detectChanges();
    }).toThrow();
  });

  it('should not throw', () => {
    expect(() => {
      const fix = TestBed.createComponent(ControlComponent);
      fix.detectChanges();
      fix.destroy();
      fix.detectChanges();
    }).not.toThrow();
  });

  it('should get at index', () => {
    const fix = TestBed.createComponent(ControlComponent);
    fix.detectChanges();
    expect(fix.componentInstance.controlArrayNameDirective.get(0)).toBeDefined();
    expect(fix.componentInstance.controlArrayNameDirective.get(1)).toBeUndefined();
  });

  it('should be iterable', () => {
    const fix = TestBed.createComponent(ControlComponent);
    fix.detectChanges();
    const array = [];
    expect(() => {
      for (const control of fix.componentInstance.controlArrayNameDirective) {
        array.push();
      }
    }).not.toThrow();
  });

  it('should be a parent', () => {
    const fix = TestBed.createComponent(ControlArrayParent);
    fix.detectChanges();
    // @ts-ignore
    expect(fix.componentInstance.controlNameDirective.controlParent).toBeDefined();
    // @ts-ignore
    expect(fix.componentInstance.controlNameDirective.controlParent).toBe(
      fix.componentInstance.controlArrayNameDirective
    );
  });
});
