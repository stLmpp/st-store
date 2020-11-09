import { ControlGroup } from './control-group';
import { ControlArray } from './control-array';
import { Control } from './control';
import {
  AfterContentInit,
  ContentChildren,
  Directive,
  OnChanges,
  OnDestroy,
  QueryList,
  SimpleChanges,
} from '@angular/core';
import { AbstractControlDirective } from './abstract-control';
import { Subject } from 'rxjs';
import { ControlChild } from './control-child';
import { takeUntil } from 'rxjs/operators';

@Directive()
export abstract class ControlParent<T = any>
  extends AbstractControlDirective
  implements OnDestroy, OnChanges, AfterContentInit {
  private _destroy$ = new Subject();

  @ContentChildren(ControlChild, { descendants: true }) allControlChilds!: QueryList<ControlChild>;

  controlChilds = new QueryList<ControlChild>();

  abstract get(name: keyof T | number): Control<T> | ControlGroup<T> | ControlArray<T> | undefined;

  ngAfterContentInit(): void {
    this.controlChilds.reset(this.allControlChilds.toArray().filter(control => control.controlParent === this));
    this.controlChilds.notifyOnChanges();
    this.allControlChilds.changes
      .pipe(takeUntil(this._destroy$))
      .subscribe((controlChilds: QueryList<ControlChild>) => {
        this.controlChilds.reset(controlChilds.toArray().filter(control => control.controlParent === this));
        this.controlChilds.notifyOnChanges();
      });
  }

  protected initAllChilds(): void {
    for (const child of this.controlChilds) {
      child.init();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.control && !changes.control.isFirstChange()) {
      this.initAllChilds();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
