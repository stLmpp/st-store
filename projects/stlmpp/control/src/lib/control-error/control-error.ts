import {
  Directive,
  Host,
  Input,
  KeyValueDiffers,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
} from '@angular/core';
import { ControlParent } from '../control-parent';
import { isNil, isNumber, isString } from 'st-utils';
import { ControlNameNotFound, ControlParentNotFound } from '../error';
import { Subject } from 'rxjs';
import { filter, map, pairwise, startWith, takeUntil } from 'rxjs/operators';
import { ValidatorsModel } from '../validator/validators';
import { ControlErrorCase } from './control-error-case';
import { Control } from '../control/control';

export type ControlErrorShowWhen = 'dirty' | 'touched' | null;

@Directive({ selector: '[controlError]', exportAs: 'controlError' })
export class ControlError implements OnInit, OnChanges, OnDestroy {
  constructor(private keyValueDiffers: KeyValueDiffers, @Host() @Optional() private controlParent?: ControlParent) {}

  private _cases = new Map<keyof ValidatorsModel, ControlErrorCase<ValidatorsModel[keyof ValidatorsModel]>>();
  private _destroy$ = new Subject();
  private _control!: Control;
  private _lastErrors: Partial<ValidatorsModel> = {};

  @Input() controlError!: Control | string | number;

  @Input() showWhen: ControlErrorShowWhen = 'touched';

  private _validateShowWhen(error: ControlErrorCase<ValidatorsModel[keyof ValidatorsModel]>): boolean {
    return (
      (isNil(error.errorShowWhen) && isNil(this.showWhen)) ||
      this._control[(error.errorShowWhen ?? this.showWhen) as 'dirty' | 'touched']
    );
  }

  private _init(): void {
    for (const [errorName] of this._cases) {
      this.removeError(errorName);
    }
    this._destroy$.next();
    if (isString(this.controlError) || isNumber(this.controlError)) {
      if (!this.controlParent) {
        throw new ControlParentNotFound('controlError', this.controlError);
      }
      const control = this.controlParent.get(this.controlError);
      if (!control) {
        throw new ControlNameNotFound('controlError', this.controlError);
      }
      if (!(control instanceof Control)) {
        throw new Error(`controlError with name ${this.controlError} is not a Control`);
      }
      this._control = control;
    } else {
      this._control = this.controlError;
    }
    this.subToErrorChanges();
  }

  addCase(errorCase: ControlErrorCase<ValidatorsModel[keyof ValidatorsModel]>): void {
    this._cases.set(errorCase.error, errorCase);
    if (this._lastErrors[errorCase.error]) {
      this.showError(errorCase.error, this._lastErrors[errorCase.error]);
    }
  }

  removeCase(errorCase: keyof ValidatorsModel): void {
    if (this._lastErrors[errorCase]) {
      this.removeError(errorCase);
    }
    this._cases.delete(errorCase);
  }

  showError(errorName: keyof ValidatorsModel, error: ValidatorsModel[keyof ValidatorsModel]): void {
    const errorCase = this._cases.get(errorName);
    if (errorCase && this._validateShowWhen(errorCase)) {
      errorCase.show(error);
    }
  }

  removeError(errorName: keyof ValidatorsModel): void {
    const errorCase = this._cases.get(errorName);
    if (errorCase) {
      errorCase.remove();
    }
  }

  updateError(errorName: keyof ValidatorsModel, error: ValidatorsModel[keyof ValidatorsModel]): void {
    const errorCase = this._cases.get(errorName);
    if (errorCase && this._validateShowWhen(errorCase)) {
      errorCase.update(error);
    }
  }

  childHasUpdate(error: ControlErrorCase<ValidatorsModel[keyof ValidatorsModel]>): void {
    this.removeError(error.error);
    this.addCase(error);
  }

  subToErrorChanges(): void {
    let differ = this.keyValueDiffers.find({}).create();
    const checkError = (errors: Partial<ValidatorsModel>): void => {
      const changes = differ.diff(errors);
      if (changes) {
        changes.forEachAddedItem(error => {
          this.showError(error.key, error.currentValue);
        });
        changes.forEachRemovedItem(error => {
          this.removeError(error.key);
        });
        changes.forEachChangedItem(error => {
          this.updateError(error.key, error.currentValue);
        });
      }
    };
    this._control.errors$.pipe(takeUntil(this._destroy$)).subscribe(errors => {
      this._lastErrors = errors;
      checkError(errors);
    });
    this._control.stateChanged$
      .pipe(
        takeUntil(this._destroy$),
        startWith(this._control.getState()),
        pairwise(),
        filter(([oldState, newState]) => oldState.touched !== newState.touched || oldState.dirty !== newState.dirty),
        map(([, newState]) => newState)
      )
      .subscribe(state => {
        if (this.showWhen && !state[this.showWhen]) {
          this._init();
        } else {
          differ = this.keyValueDiffers.find({}).create();
          checkError(this._lastErrors);
        }
      });
  }

  ngOnInit(): void {
    this._init();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes.controlError && !changes.controlError.isFirstChange()) ||
      (changes.showWhen && !changes.showWhen.isFirstChange())
    ) {
      this._init();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
