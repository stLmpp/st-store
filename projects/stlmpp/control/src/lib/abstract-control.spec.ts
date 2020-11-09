import { Component, OnInit } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from './st-control.module';
import { Control } from './control/control';

@Component({ template: '<input [control]="control" [disabled]="disabled">' })
export class ControlComponent {
  control = new Control();
  disabled = false;
}

@Component({ template: '<input [control]="control" [disabled]="disabled">' })
export class ControlDComponent implements OnInit {
  control!: Control;
  disabled = true;

  ngOnInit(): void {
    this.control = new Control();
  }
}

describe('abstract control', () => {
  let fixture: ComponentFixture<ControlComponent>;
  let component: ControlComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StControlModule],
      declarations: [ControlComponent, ControlDComponent],
    });
    fixture = TestBed.createComponent(ControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should disable the control', () => {
    expect(component.control.disabled).toBeFalse();
    component.disabled = true;
    fixture.detectChanges();
    expect(component.control.disabled).toBeTrue();
  });
});
