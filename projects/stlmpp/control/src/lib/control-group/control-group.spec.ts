import { Component } from '@angular/core';
import { ControlGroup } from './control-group';
import { Control } from '../control/control';
import { Validators } from '../validator/validators';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { AsyncValidator, triggerEvent, wait } from '../util-tests';

interface Group {
  id: number | undefined;
  name: string;
}

interface GroupNested extends Group {
  nested: Group;
}

@Component({
  template: `
    <div [controlGroup]="controlGroup">
      <input type="number" controlName="id" />
      <input controlName="name" />
    </div>
    <form class="group-nested" [controlGroup]="controlGroupNested">
      <input type="number" class="id" controlName="id" />
      <input class="name" controlName="name" />
      <div class="nested" controlGroupName="nested">
        <input type="number" class="id" controlName="id" />
        <input class="name" controlName="name" />
      </div>
    </form>
  `,
})
class ControlComponent {
  controlGroup = new ControlGroup<Group>({
    id: new Control<number | undefined>(undefined),
    name: new Control(''),
  });

  controlGroupNested = new ControlGroup<GroupNested>({
    id: new Control<number | undefined>(undefined),
    name: new Control(''),
    nested: new ControlGroup({ id: new Control<number | undefined>(undefined), name: new Control('') }),
  });
}

describe('control group', () => {
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

  it('should set updateOn of all children on creation', () => {
    const controlGroup = new ControlGroup<Group>(
      { id: new Control<number | undefined>(undefined), name: new Control('') },
      { updateOn: 'blur' }
    );
    expect(controlGroup.get('id').updateOn).toBe('blur');
    expect(controlGroup.get('name').updateOn).toBe('blur');
  });

  it('should disable all children on creation', () => {
    const controlGroup = new ControlGroup<Group>(
      { id: new Control<number | undefined>(undefined), name: new Control('') },
      { disabled: true }
    );
    expect(controlGroup.get('id').disabled).toBeTrue();
    expect(controlGroup.get('name').disabled).toBeTrue();
  });

  it('should emit the value of all controls', () => {
    const controlGroup = new ControlGroup<Group>({
      id: new Control<number | undefined>(undefined),
      name: new Control(''),
    });
    const sub = jasmine.createSpy('sub');
    controlGroup.value$.subscribe(sub);
    expect(sub).toHaveBeenCalledTimes(1);
    expect(sub).toHaveBeenCalledWith({ id: undefined, name: '' });
    controlGroup.get('id').setValue(1);
    expect(sub).toHaveBeenCalledTimes(2);
    expect(sub).toHaveBeenCalledWith({ id: 1, name: '' });
  });

  it('should get/set parent', () => {
    const controlGroup = new ControlGroup<Group>({
      id: new Control<number | undefined>(undefined),
      name: new Control(''),
    });
    const controlGroupParent = new ControlGroup({});
    controlGroup.parent = controlGroupParent;
    expect(controlGroup.parent).toBe(controlGroupParent);
  });

  it('should set updateOn of all children', () => {
    const controlGroup = new ControlGroup<Group>({
      id: new Control<number | undefined>(undefined),
      name: new Control(''),
    });
    controlGroup.setUpdateOn('submit');
    expect(controlGroup.get('id').updateOn).toBe('submit');
    expect(controlGroup.get('name').updateOn).toBe('submit');
    controlGroup.setUpdateOn(undefined);
    expect(controlGroup.get('id').updateOn).toBe('submit');
    expect(controlGroup.get('name').updateOn).toBe('submit');
  });

  it('should get the value of all controls', () => {
    const controlGroup = new ControlGroup<Group>({ id: new Control<number | undefined>(1), name: new Control('a') });
    expect(controlGroup.value).toEqual({ id: 1, name: 'a' });
    controlGroup.get('name').setValue('b');
    expect(controlGroup.value).toEqual({ id: 1, name: 'b' });
  });

  it('should get valid/invalid state', () => {
    component.controlGroup = new ControlGroup<Group>({
      id: new Control(1, [Validators.required]),
      name: new Control('a', [Validators.required]),
    });
    fixture.detectChanges();
    const controlGroup = component.controlGroup;
    expect(controlGroup.invalid).toBeFalse();
    const input = fixture.debugElement.query(By.css('input'));
    triggerEvent(input, 'input', '');
    fixture.detectChanges();
    expect(controlGroup.invalid).toBeTrue();
  });

  it('should get dirty/pristine state', () => {
    const controlGroup = component.controlGroup;
    expect(controlGroup.dirty).toBeFalse();
    const input = fixture.debugElement.query(By.css('input'));
    triggerEvent(input, 'input', '2');
    fixture.detectChanges();
    expect(controlGroup.dirty).toBeTrue();
  });

  it('should get touched/untouched state', () => {
    const controlGroup = component.controlGroup;
    expect(controlGroup.touched).toBeFalse();
    const input = fixture.debugElement.query(By.css('input'));
    triggerEvent(input, 'blur');
    fixture.detectChanges();
    expect(controlGroup.touched).toBeTrue();
  });

  it('should get the pending state', async () => {
    const controlGroup = component.controlGroup;
    controlGroup.get('id').setValidator(new AsyncValidator());
    fixture.detectChanges();
    expect(controlGroup.pending).toBeTrue();
    await wait(15);
    expect(controlGroup.pending).toBeFalse();
    const input = fixture.debugElement.query(By.css('input'));
    triggerEvent(input, 'input', '2');
    fixture.detectChanges();
    expect(controlGroup.pending).toBeTrue();
    await wait(15);
    expect(controlGroup.pending).toBeFalse();
  });

  it('should get the disabled/enabled state', () => {
    const controlGroup = component.controlGroup;
    expect(controlGroup.disabled).toBeFalse();
    controlGroup.disable();
    fixture.detectChanges();
    expect(controlGroup.enabled).toBeFalse();
    controlGroup.get('id').enable();
    fixture.detectChanges();
    expect(controlGroup.disabled).toBeFalse();
  });

  it('should disable all controls', () => {
    const controlGroup = component.controlGroup;
    expect(controlGroup.get('id').disabled).toBeFalse();
    expect(controlGroup.get('name').disabled).toBeFalse();
    controlGroup.disable();
    fixture.detectChanges();
    expect(controlGroup.get('id').disabled).toBeTrue();
    expect(controlGroup.get('name').disabled).toBeTrue();
    controlGroup.disable(false);
    fixture.detectChanges();
    expect(controlGroup.get('id').disabled).toBeFalse();
    expect(controlGroup.get('name').disabled).toBeFalse();
  });

  it('should enable all controls', () => {
    const controlGroup = component.controlGroup;
    expect(controlGroup.get('id').enabled).toBeTrue();
    expect(controlGroup.get('name').enabled).toBeTrue();
    controlGroup.enable(false);
    fixture.detectChanges();
    expect(controlGroup.get('id').enabled).toBeFalse();
    expect(controlGroup.get('name').enabled).toBeFalse();
    controlGroup.enable();
    fixture.detectChanges();
    expect(controlGroup.get('id').enabled).toBeTrue();
    expect(controlGroup.get('name').enabled).toBeTrue();
  });

  it('should set the value of all controls', () => {
    const controlGroup = component.controlGroup;
    expect(controlGroup.value).toEqual({ id: undefined, name: '' });
    controlGroup.setValue({ id: 1, name: 'string' });
    fixture.detectChanges();
    expect(controlGroup.value).toEqual({ id: 1, name: 'string' });
  });

  it('should set undefined on missing properties on setValue (but the correct way is to use the patchValue)', () => {
    const controlGroup = component.controlGroupNested;
    controlGroup.setValue({ id: 1 } as any);
    fixture.detectChanges();
    expect(controlGroup.value).toEqual({ id: 1, name: undefined, nested: { id: undefined, name: undefined } } as any);
  });

  it('should patch the value of all controls', () => {
    const controlGroup = component.controlGroupNested;
    controlGroup.patchValue({ id: 1, nested: { name: 'string' } });
    fixture.detectChanges();
    expect(controlGroup.value).toEqual({ id: 1, name: '', nested: { id: undefined, name: 'string' } } as any);
  });

  it('should get the control', () => {
    const controlGroup = component.controlGroupNested;
    expect(controlGroup.get('name')).toBeDefined();
    expect(controlGroup.get('nested')).toBeInstanceOf(ControlGroup);
    expect(controlGroup.get('not exists' as any)).toBeUndefined();
  });

  it('should reset all controls', async () => {
    component.controlGroupNested = new ControlGroup<GroupNested>({
      id: new Control<number | undefined>(1),
      name: new Control(''),
      nested: new ControlGroup({ id: new Control<number | undefined>(undefined), name: new Control('string') }),
    });
    fixture.detectChanges();
    const controlGroup = component.controlGroupNested;
    const input = fixture.debugElement.query(By.css('.group-nested > .nested > .id'));
    triggerEvent(input, 'input', '12');
    fixture.detectChanges();
    expect(controlGroup.get('nested').get('id').value).toBe(12);
    expect(controlGroup.get('nested').get('id').dirty).toBeTrue();
    expect(controlGroup.dirty).toBeTrue();
    controlGroup.reset();
    fixture.detectChanges();
    expect(controlGroup.value).toEqual({ id: 1, name: '', nested: { id: undefined, name: 'string' } } as any);
    expect(controlGroup.dirty).toBeFalse();
  });

  it('should submit all controls', () => {
    component.controlGroupNested = new ControlGroup<GroupNested>(
      {
        id: new Control<number | undefined>(1),
        name: new Control(''),
        nested: new ControlGroup({ id: new Control<number | undefined>(undefined), name: new Control('string') }),
      },
      { updateOn: 'submit' }
    );
    fixture.detectChanges();
    triggerEvent(fixture.debugElement.query(By.css('.group-nested > .nested > .id')), 'input', '124');
    fixture.detectChanges();
    triggerEvent(fixture.debugElement.query(By.css('.group-nested > .id')), 'input', '2');
    fixture.detectChanges();
    triggerEvent(fixture.debugElement.query(By.css('.group-nested > .name')), 'input', 'string');
    fixture.detectChanges();
    expect(component.controlGroupNested.value).toEqual({
      id: 1,
      name: '',
      nested: { id: undefined, name: 'string' },
    } as any);
    component.controlGroupNested.submit();
    fixture.detectChanges();
    expect(component.controlGroupNested.value).toEqual({ id: 2, name: 'string', nested: { id: 124, name: 'string' } });
  });

  it('should mark all controls as dirty', () => {
    component.controlGroupNested.markAsDirty();
    fixture.detectChanges();
    expect(component.controlGroupNested.dirty).toBeTrue();
    expect(component.controlGroupNested.get('nested').dirty).toBeTrue();
    expect(component.controlGroupNested.get('id').dirty).toBeTrue();
    expect(component.controlGroupNested.get('name').dirty).toBeTrue();
    expect(component.controlGroupNested.get('nested').get('id').dirty).toBeTrue();
    expect(component.controlGroupNested.get('nested').get('name').dirty).toBeTrue();
    component.controlGroupNested.markAsDirty(false);
    fixture.detectChanges();
    expect(component.controlGroupNested.dirty).toBeFalse();
    expect(component.controlGroupNested.get('nested').dirty).toBeFalse();
    expect(component.controlGroupNested.get('id').dirty).toBeFalse();
    expect(component.controlGroupNested.get('name').dirty).toBeFalse();
    expect(component.controlGroupNested.get('nested').get('id').dirty).toBeFalse();
    expect(component.controlGroupNested.get('nested').get('name').dirty).toBeFalse();
  });

  it('should mark all controls as touched', () => {
    component.controlGroupNested.markAsTouched();
    fixture.detectChanges();
    expect(component.controlGroupNested.touched).toBeTrue();
    expect(component.controlGroupNested.get('nested').touched).toBeTrue();
    expect(component.controlGroupNested.get('id').touched).toBeTrue();
    expect(component.controlGroupNested.get('name').touched).toBeTrue();
    expect(component.controlGroupNested.get('nested').get('id').touched).toBeTrue();
    expect(component.controlGroupNested.get('nested').get('name').touched).toBeTrue();
    component.controlGroupNested.markAsTouched(false);
    fixture.detectChanges();
    expect(component.controlGroupNested.touched).toBeFalse();
    expect(component.controlGroupNested.get('nested').touched).toBeFalse();
    expect(component.controlGroupNested.get('id').touched).toBeFalse();
    expect(component.controlGroupNested.get('name').touched).toBeFalse();
    expect(component.controlGroupNested.get('nested').get('id').touched).toBeFalse();
    expect(component.controlGroupNested.get('nested').get('name').touched).toBeFalse();
  });

  it('should mark all controls as invalid', () => {
    component.controlGroupNested.markAsInvalid();
    fixture.detectChanges();
    expect(component.controlGroupNested.invalid).toBeTrue();
    expect(component.controlGroupNested.get('nested').invalid).toBeTrue();
    expect(component.controlGroupNested.get('id').invalid).toBeTrue();
    expect(component.controlGroupNested.get('name').invalid).toBeTrue();
    expect(component.controlGroupNested.get('nested').get('id').invalid).toBeTrue();
    expect(component.controlGroupNested.get('nested').get('name').invalid).toBeTrue();
    component.controlGroupNested.markAsInvalid(false);
    fixture.detectChanges();
    expect(component.controlGroupNested.invalid).toBeFalse();
    expect(component.controlGroupNested.get('nested').invalid).toBeFalse();
    expect(component.controlGroupNested.get('id').invalid).toBeFalse();
    expect(component.controlGroupNested.get('name').invalid).toBeFalse();
    expect(component.controlGroupNested.get('nested').get('id').invalid).toBeFalse();
    expect(component.controlGroupNested.get('nested').get('name').invalid).toBeFalse();
  });
});
