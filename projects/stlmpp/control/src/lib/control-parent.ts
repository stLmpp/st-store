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
import { Control } from './control/control';
import { ControlArray } from './control-array/control-array';
import { ControlGroup } from './control-group/control-group';

@Directive()
export abstract class ControlParent<T = any>
  extends AbstractControlDirective
  implements OnDestroy, OnChanges, AfterContentInit
{
  private readonly _destroy$ = new Subject<void>();

  @ContentChildren(ControlChild, { descendants: true }) readonly allControlChildren!: QueryList<ControlChild>;

  readonly controlChildren = new QueryList<ControlChild>();

  protected initAllChildren(): void {
    for (const child of this.controlChildren) {
      child.init();
    }
  }

  ngAfterContentInit(): void {
    this.controlChildren.reset(this.allControlChildren.toArray().filter(control => control.controlParent === this));
    this.controlChildren.notifyOnChanges();
    this.allControlChildren.changes
      .pipe(takeUntil(this._destroy$))
      .subscribe((controlChildren: QueryList<ControlChild>) => {
        this.controlChildren.reset(controlChildren.toArray().filter(control => control.controlParent === this));
        this.controlChildren.notifyOnChanges();
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.control && !changes.control.isFirstChange()) {
      this.initAllChildren();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }

  abstract get<K extends keyof T>(name: K | number): Control<T[K]> | ControlGroup<T[K]> | ControlArray | undefined;
}
