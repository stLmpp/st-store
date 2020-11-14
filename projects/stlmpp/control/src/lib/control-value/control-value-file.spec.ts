import { Component, DebugElement } from '@angular/core';
import { Control } from '../control/control';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';

@Component({ template: `<input type="file" [control]="control" />` })
class ControlComponent {
  control = new Control<FileList>();
}

describe('control value file', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;
  let input: DebugElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent],
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
    component.control.setValue('TESTE' as any);
    fixture.detectChanges();
    expect(input.nativeElement.value).toBe('');
  });
});