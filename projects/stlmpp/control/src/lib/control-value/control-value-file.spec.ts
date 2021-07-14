import { Component, DebugElement, ViewChild } from '@angular/core';
import { Control } from '../control/control';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { ControlValueFile } from './control-value-file';

@Component({ template: `<input type="file" [control]="control" />` })
class ControlComponent {
  @ViewChild(ControlValueFile) controlValueFile!: ControlValueFile;
  control = new Control<FileList | null>(null, { initialFocus: true });
}

@Component({ template: '<input type="file" [(model)]="model">' })
class ModelComponent {
  model = null;
}

describe('control value file', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;
  let input: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent, ModelComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    input = fixture.debugElement.query(By.css('input[type=file]'));
  });

  it('should clear the input value is null', () => {
    component.control.setValue(null);
    fixture.detectChanges();
    expect(input.nativeElement.value).toBe('');
  });

  it('should not do anything is value is different and than null or undefined', () => {
    component.control.setValue('TEST' as any);
    fixture.detectChanges();
    expect(input.nativeElement.value).toBe('');
  });

  it('should work with model', () => {
    expect(() => {
      TestBed.createComponent(ModelComponent).detectChanges();
    }).not.toThrow();
  });

  it('should trigger onChange$', () => {
    const sub = jasmine.createSpy();
    component.controlValueFile.onChange$.subscribe(sub);
    input.triggerEventHandler('change', { target: { files: [] } });
    fixture.detectChanges();
    expect(sub).toHaveBeenCalledTimes(1);
  });

  it('should start with focus', () => {
    expect(input.nativeElement).toBe(document.activeElement);
  });
});
