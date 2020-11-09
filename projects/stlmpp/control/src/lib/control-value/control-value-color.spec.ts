import { Component, DebugElement } from '@angular/core';
import { Control } from '../control';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../st-control.module';
import { By } from '@angular/platform-browser';
import { wait } from '../util-tests';

@Component({ template: '<input type="color" [control]="control">' })
class ControlComponent {
  control = new Control();
}

describe('control value color', () => {
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
    input = fixture.debugElement.query(By.css('input'));
  });

  it('should set value if any', async () => {
    await wait(10);
    expect(component.control.value).toBeDefined();
  });
});
