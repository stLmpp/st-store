import { Component, ViewChild } from '@angular/core';
import { ControlGroup } from './control-group';
import { Control } from '../control';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { ControlGroupDirective } from './control-group.directive';

interface Group {
  id: number;
  name: string;
}

interface GroupNested extends Group {
  nested: Group;
}

@Component({
  template: `
    <form class="group-nested" [controlGroup]="controlGroupNested" #groupRef="controlGroup">
      <input type="number" class="id" controlName="id" />
      <input class="name" controlName="name" />
      <div class="nested" controlGroupName="nested">
        <input type="number" class="id" controlName="id" />
        <input class="name" controlName="name" />
      </div>
      <button type="submit"></button>
    </form>
  `,
})
class ControlComponent {
  @ViewChild('groupRef') controlGroupDirective!: ControlGroupDirective<GroupNested>;

  controlGroupNested = new ControlGroup<GroupNested>({
    id: new Control(),
    name: new Control(),
    nested: new ControlGroup({ id: new Control(), name: new Control() }),
  });
}

describe('control group directive', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, StControlModule],
      declarations: [ControlComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should add class is-submitted when the form is submitted', () => {
    const btn = fixture.debugElement.query(By.css('button[type=submit]'));
    const form = fixture.debugElement.query(By.css('form'));
    expect(form.nativeElement).not.toHaveClass('is-submitted');
    btn.nativeElement.click();
    fixture.detectChanges();
    expect(form.nativeElement).toHaveClass('is-submitted');
  });

  it('should get child', () => {
    expect(component.controlGroupDirective.get('id')).toBeDefined();
    expect(component.controlGroupDirective.get('not exists' as any)).toBeUndefined();
  });
});
