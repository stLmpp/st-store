import { Component, ViewChild } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NgLetModule } from './ng-let.module';
import { By } from '@angular/platform-browser';
import { NgLetDirective } from './ng-let.directive';

@Component({
  template: `
    <ng-container *ngLet="obs$ | async as obs">
      <div class="exists">{{ obs }}</div>
    </ng-container>
  `,
})
class NgLetComponent {
  @ViewChild(NgLetDirective) ngLetDirective!: NgLetDirective<boolean>;

  obs$ = new BehaviorSubject(false);
}

describe('ng let directive', () => {
  let component: NgLetComponent;
  let fixture: ComponentFixture<NgLetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NgLetComponent],
      imports: [NgLetModule],
    }).compileComponents();
    fixture = TestBed.createComponent(NgLetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should start with a value', () => {
    expect(component.ngLetDirective.context.ngLet).toBe(false);
    expect(component.ngLetDirective.context.$implicit).toBe(false);
    expect(fixture.debugElement.query(By.css('div')).nativeElement.innerText).toBe('false');
  });

  it('should not hide content like ngIf', () => {
    const element = fixture.debugElement.query(By.css('div'));
    expect(element?.nativeElement).toBeDefined();
    expect(element?.nativeElement).not.toBeNull();
  });

  it('should update the value', () => {
    component.obs$.next(true);
    fixture.detectChanges();
    expect(component.ngLetDirective.context.ngLet).toBe(true);
    expect(component.ngLetDirective.context.$implicit).toBe(true);
    expect(fixture.debugElement.query(By.css('div')).nativeElement.innerText).toBe('true');
  });

  it('should return type guard', () => {
    expect(NgLetDirective.ngTemplateContextGuard(component.ngLetDirective, {})).toBeTrue();
  });
});
