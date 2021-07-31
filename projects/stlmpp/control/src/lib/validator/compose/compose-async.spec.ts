import { ControlValidator } from '../validator';
import { delay, map, Observable, timer } from 'rxjs';
import { Control } from '../../control/control';
import { Component, DebugElement } from '@angular/core';
import { Validators } from '../validators';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StControlModule } from '../../st-control.module';
import { By } from '@angular/platform-browser';
import { wait } from '../../util-tests';

class AsyncValOne extends ControlValidator {
  override async = true;
  override attrs = { attr1: undefined };
  override classes = 'one';
  name = 'one';

  validate(control: Control<string>): Observable<any> | Observable<null> | any | null {
    return timer(10).pipe(map(() => (!control.value?.includes('A') ? true : null)));
  }
}

class AsyncValTwo extends AsyncValOne {
  override name = 'two';
  override classes = 'two';
  override attrs = { ...super.attrs, attr2: undefined };

  override validate(control: Control<string>): Observable<any> | Observable<null> | any | null {
    return super.validate(control).pipe(
      delay(10),
      map(() => (!control.value?.includes('B') ? true : null))
    );
  }
}

class AsyncValNull extends ControlValidator {
  override async = true;
  name = 'null';

  validate(control: Control<string>): Observable<any> | Observable<null> | any | null {
    return null;
  }
}

@Component({ template: `<input [control]="control" />` })
class ControlComponent {
  control = new Control('', Validators.composeAsync(new AsyncValOne(), new AsyncValTwo(), new AsyncValNull()));
}

describe('compose validator', () => {
  let component: ControlComponent;
  let fixture: ComponentFixture<ControlComponent>;
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

  it('should set the combined attributes of composed validators', () => {
    expect(input.attributes.attr1).toBeDefined();
    expect(input.attributes.attr2).toBeDefined();
  });

  it('should set the combined classes of composed validators', () => {
    expect(input.nativeElement).toHaveClass('one');
    expect(input.nativeElement).toHaveClass('two');
  });

  it('should return an object with the composed errors', async () => {
    expect(component.control.getError('composeAsync')).toBeUndefined();
    await wait(15);
    expect(component.control.getError('composeAsync')).toBeUndefined();
    await wait(15);
    expect(component.control.getError('composeAsync')).toEqual({ one: true, two: true });
  });

  it('should return null if none of composed validators return errors', async () => {
    component.control.setValue('ABC');
    fixture.detectChanges();
    await wait(30);
    expect(component.control.getError('composeAsync')).toBeUndefined();
  });
});
