import { Component, Input } from '@angular/core';
import { ControlGroup } from '../control-group/control-group';
import { ControlArray } from './control-array';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { CommonModule } from '@angular/common';
import { AsyncValidator, triggerEvent, wait } from '../util-tests';
import { By } from '@angular/platform-browser';
import { Validators } from '../validator/validators';
import { Control } from '../control/control';

interface Group {
  array: string[];
}

@Component({
  template: `
    <div [controlGroup]="controlGroup">
      <div controlArrayName="array" #controlArray="controlArrayName">
        <input
          class="input-{{ $index }}"
          type="text"
          *ngFor="let control of controlArray; let $index = index"
          [controlName]="$index"
        />
      </div>
    </div>
  `,
})
class ControlArrayComponent {
  @Input() controlGroup = new ControlGroup<Group>({ array: new ControlArray([new Control(''), new Control('')]) });

  get array(): ControlArray<string> {
    return this.controlGroup.get('array');
  }
}

describe('control array', () => {
  let fixture: ComponentFixture<ControlArrayComponent>;
  let component: ControlArrayComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommonModule, StControlModule],
      declarations: [ControlArrayComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlArrayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the form array', () => {
    expect(component.controlGroup).toBeDefined();
    expect(component.array).toBeDefined();
    expect(component.array.length).toBe(2);
  });

  it('should create with updateOn', () => {
    component.controlGroup = new ControlGroup<Group>({
      array: new ControlArray([new Control(''), new Control('')], { updateOn: 'blur' }),
    });
    fixture.detectChanges();
    const array = component.array;
    expect(array.get(0)?.updateOn).toBe('blur');
    expect(array.get(1)?.updateOn).toBe('blur');
  });

  it('should create with disabled option', () => {
    component.controlGroup = new ControlGroup<Group>({
      array: new ControlArray([new Control(''), new Control('')], { disabled: true }),
    });
    fixture.detectChanges();
    const array = component.array;
    expect(array.get(0)?.disabled).toBeTrue();
    expect(array.get(1)?.disabled).toBeTrue();
  });

  it('should emit the value', () => {
    const array = component.array;
    const sub = jasmine.createSpy('sub');
    array.value$.subscribe(sub);
    expect(sub).toHaveBeenCalledTimes(1);
    expect(sub).toHaveBeenCalledWith(['', '']);
    array.push(new Control(''));
    fixture.detectChanges();
    expect(sub).toHaveBeenCalledTimes(2);
    expect(sub).toHaveBeenCalledWith(['', '', '']);
    triggerEvent(fixture.debugElement.query(By.css('.input-0')), 'input', 'string1');
    fixture.detectChanges();
    expect(sub).toHaveBeenCalledTimes(3);
    expect(sub).toHaveBeenCalledWith(['string1', '', '']);
  });

  it('should emit the valueChanges', () => {
    const array = component.array;
    const sub = jasmine.createSpy('sub');
    array.valueChanges$.subscribe(sub);
    expect(sub).toHaveBeenCalledTimes(0);
    array.push(new Control(''));
    fixture.detectChanges();
    expect(sub).toHaveBeenCalledTimes(1);
    expect(sub).toHaveBeenCalledWith(['', '', '']);
    triggerEvent(fixture.debugElement.query(By.css('.input-0')), 'input', 'string1');
    fixture.detectChanges();
    expect(sub).toHaveBeenCalledTimes(2);
    expect(sub).toHaveBeenCalledWith(['string1', '', '']);
  });

  it('should get the parent', () => {
    expect(component.array.parent).toBeInstanceOf(ControlGroup);
  });

  it('should be iterable', () => {
    const indices = [];
    for (const control of component.array) {
      indices.push(control);
    }
    expect(indices.length).toBe(2);
    expect(indices[0]).toBeInstanceOf(Control);
    expect(indices[1]).toBeInstanceOf(Control);
  });

  it('should set updateOn of all childs', () => {
    component.array.setUpdateOn('submit');
    fixture.detectChanges();
    expect(component.array.get(0)?.updateOn).toBe('submit');
    expect(component.array.get(1)?.updateOn).toBe('submit');
    component.array.setUpdateOn(undefined);
    fixture.detectChanges();
    expect(component.array.get(0)?.updateOn).toBe('submit');
    expect(component.array.get(1)?.updateOn).toBe('submit');
  });

  it('should get the value', () => {
    expect(component.array.value).toEqual(['', '']);
    triggerEvent(fixture.debugElement.query(By.css('.input-0')), 'input', 's');
    fixture.detectChanges();
    expect(component.array.value).toEqual(['s', '']);
  });

  it('should get valid/invalid state', () => {
    const array = component.array;
    expect(array.invalid).toBeFalse();
    array.push(new Control('', Validators.required));
    fixture.detectChanges();
    expect(array.invalid).toBeTrue();
    triggerEvent(fixture.debugElement.query(By.css('.input-2')), 'input', 's');
    fixture.detectChanges();
    expect(array.valid).toBeTrue();
  });

  it('should get dirty/pristine state', () => {
    const array = component.array;
    expect(array.pristine).toBeTrue();
    triggerEvent(fixture.debugElement.query(By.css('.input-0')), 'input', 's');
    fixture.detectChanges();
    expect(array.dirty).toBeTrue();
  });

  it('should get the touched/untouced state', () => {
    const array = component.array;
    expect(array.untouched).toBeTrue();
    triggerEvent(fixture.debugElement.query(By.css('.input-0')), 'blur');
    fixture.detectChanges();
    expect(array.touched).toBeTrue();
  });

  it('should get the pending state', async () => {
    const array = component.array;
    expect(array.pending).toBeFalse();
    array.push(new Control('', new AsyncValidator()));
    fixture.detectChanges();
    expect(array.pending).toBeTrue();
    await wait(15);
    expect(array.pending).toBeFalse();
  });

  it('should get the controls', () => {
    const controls = component.array.controls;
    expect(controls).toBeDefined();
    expect(controls.length).toBe(2);
    expect(controls[0]).toBeInstanceOf(Control);
    expect(controls[1]).toBeInstanceOf(Control);
  });

  it('should get the disabled/enabled state', () => {
    const array = component.array;
    expect(array.disabled).toBeFalse();
    array.get(0)?.disable();
    fixture.detectChanges();
    expect(array.disabled).toBeFalse();
    array.get(1)?.disable();
    fixture.detectChanges();
    expect(array.enabled).toBeFalse();
  });

  it('should get at index', () => {
    const array = component.array;
    expect(array.get(0)).toBeDefined();
    expect(array.get(1)).toBeInstanceOf(Control);
    expect(array.get(1)).toBeDefined();
    expect(array.get(0)).toBeInstanceOf(Control);
    expect(array.get(3)).toBeUndefined();
  });

  it('should push a new control', () => {
    const array = component.array;
    array.push(new Control(''));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.input-2'))).toBeDefined();
    expect(array.length).toBe(3);
    expect(array.get(2)).toBeDefined();
  });

  it('should push with updateOn', () => {
    component.controlGroup = new ControlGroup<Group>({
      array: new ControlArray([new Control(''), new Control('')], { updateOn: 'blur' }),
    });
    fixture.detectChanges();
    const array = component.array;
    array.push(new Control(''));
    fixture.detectChanges();
    expect(array.get(2)?.updateOn).toBe('blur');
  });

  it('should insert a new control', () => {
    const array = component.array;
    triggerEvent(fixture.debugElement.query(By.css('.input-0')), 'input', 'a');
    fixture.detectChanges();
    array.insert(0, new Control('b'));
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('.input-1')).nativeElement.value).toBe('a');
    expect(fixture.debugElement.query(By.css('.input-0')).nativeElement.value).toBe('b');
  });

  it('should insert with updateOn', () => {
    component.controlGroup = new ControlGroup<Group>({
      array: new ControlArray([new Control(''), new Control('')], { updateOn: 'blur' }),
    });
    fixture.detectChanges();
    const array = component.array;
    fixture.detectChanges();
    array.insert(0, new Control('b'));
    expect(array.controls.every(control => control.updateOn === 'blur')).toBeTrue();
  });

  it('should remove at', () => {
    const array = component.array;
    const sub = jasmine.createSpy('sub');
    array.value$.subscribe(sub);
    expect(sub).toHaveBeenCalledWith(['', '']);
    array.removeAt(0);
    expect(array.length).toBe(1);
    expect(sub).toHaveBeenCalledWith(['']);
  });

  it('should set the value', () => {
    const array = component.array;
    array.setValue(['a', 'b', 'c']);
    fixture.detectChanges();
    expect(array.get(0)?.value).toBe('a');
    expect(array.get(1)?.value).toBe('b');
    expect(array.value).toEqual(['a', 'b']);
  });

  it('should patch the values', () => {
    const array = new ControlArray<{ id: number; name: string }>([
      new ControlGroup({ id: new Control(0), name: new Control('') }),
      new ControlGroup({ id: new Control(0), name: new Control('') }),
    ]);
    array.patchValue([{ id: 1 }, { name: 's' }, { name: 's' }]);
    expect(array.value).toEqual([
      { id: 1, name: '' },
      { id: 0, name: 's' },
    ] as any);
  });

  it('should disable all controls', () => {
    const array = component.array;
    array.disable();
    fixture.detectChanges();
    expect(array.disabled).toBeTrue();
    expect(array.get(0)?.disabled).toBeTrue();
    expect(array.get(1)?.disabled).toBeTrue();
    array.disable(false);
    fixture.detectChanges();
    expect(array.disabled).toBeFalse();
    expect(array.get(0)?.disabled).toBeFalse();
    expect(array.get(1)?.disabled).toBeFalse();
    array.enable(false);
    fixture.detectChanges();
    expect(array.disabled).toBeTrue();
    expect(array.get(0)?.disabled).toBeTrue();
    expect(array.get(1)?.disabled).toBeTrue();
    array.enable();
    expect(array.disabled).toBeFalse();
    expect(array.get(0)?.disabled).toBeFalse();
    expect(array.get(1)?.disabled).toBeFalse();
  });

  it('should reset', () => {
    const array = component.array;
    const sub = jasmine.createSpy('sub');
    array.value$.subscribe(sub);
    array.push(new Control(''));
    fixture.detectChanges();
    triggerEvent(fixture.debugElement.query(By.css('.input-0')), 'input', 's');
    triggerEvent(fixture.debugElement.query(By.css('.input-2')), 'input', 's2');
    fixture.detectChanges();
    expect(sub).toHaveBeenCalledWith(['s', '', 's2']);
    array.reset();
    fixture.detectChanges();
    expect(sub).toHaveBeenCalledWith(['', '']);
    expect(array.length).toBe(2);
  });

  it('should clear', () => {
    const array = component.array;
    const sub = jasmine.createSpy('sub');
    array.value$.subscribe(sub);
    expect(sub).toHaveBeenCalledWith(['', '']);
    array.clear();
    fixture.detectChanges();
    expect(array.length).toBe(0);
    expect(fixture.debugElement.query(By.css('.input-0'))).toBeNull();
    expect(sub).toHaveBeenCalledWith([]);
  });

  it('should submit', () => {
    const array = component.array;
    array.setUpdateOn('submit');
    fixture.detectChanges();
    triggerEvent(fixture.debugElement.query(By.css('.input-0')), 'input', 's');
    fixture.detectChanges();
    expect(array.value[0]).toBe('');
    array.submit();
    fixture.detectChanges();
    expect(array.value[0]).toBe('s');
  });

  it('should mark all controls as dirty', () => {
    const array = component.array;
    array.markAsDirty();
    fixture.detectChanges();
    expect(array.dirty).toBeTrue();
    array.markAsDirty(false);
    expect(array.dirty).toBeFalse();
  });

  it('should mark all controls as touched', () => {
    const array = component.array;
    array.markAsTouched();
    fixture.detectChanges();
    expect(array.touched).toBeTrue();
    array.markAsTouched(false);
    expect(array.touched).toBeFalse();
  });

  it('should mark all controls as invalid', () => {
    const array = component.array;
    array.markAsInvalid();
    fixture.detectChanges();
    expect(array.invalid).toBeTrue();
    array.markAsInvalid(false);
    expect(array.invalid).toBeFalse();
  });
});
