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
import { isNil } from '@stlmpp/utils';
import { ControlNameNotFound, ControlParentNotFound } from '../error';
import { Subject } from 'rxjs';
import { filter, pairwise, startWith, takeUntil } from 'rxjs/operators';
import { ValidatorsModel } from '../validator/validators';
import { ControlErrorCase } from './control-error-case';
import { isID } from '@stlmpp/utils';
import { Control } from '../control/control';

export type ControlErrorShowWhen = 'dirty' | 'touched' | null;

@Directive({ selector: '[controlError]', exportAs: 'controlError' })
export class ControlError implements OnInit, OnChanges, OnDestroy {
  constructor(private keyValueDiffers: KeyValueDiffers, @Host() @Optional() private controlParent?: ControlParent) {}

  private _cases = new Map<keyof ValidatorsModel, ControlErrorCase<ValidatorsModel[keyof ValidatorsModel]>>();
  private _destroy$ = new Subject();

  @Input() controlError!: Control | string | number;

  @Input() showWhen: ControlErrorShowWhen = 'touched';

  private control!: Control;

  private lastErrors: Partial<ValidatorsModel> = {};

  private validateShowWhen(error: ControlErrorCase<ValidatorsModel[keyof ValidatorsModel]>): boolean {
    return (
      (isNil(error.errorShowWhen) && isNil(this.showWhen)) ||
      this.control[(error.errorShowWhen ?? this.showWhen) as 'dirty' | 'touched']
    );
  }

  addCase(errorCase: ControlErrorCase<ValidatorsModel[keyof ValidatorsModel]>): void {
    this._cases.set(errorCase.error, errorCase);
    if (this.lastErrors[errorCase.error]) {
      this.showError(errorCase.error, this.lastErrors[errorCase.error]);
    }
  }

  removeCase(errorCase: keyof ValidatorsModel): void {
    if (this.lastErrors[errorCase]) {
      this.removeError(errorCase);
    }
    this._cases.delete(errorCase);
  }

  showError(errorName: keyof ValidatorsModel, error: ValidatorsModel[keyof ValidatorsModel]): void {
    const errorCase = this._cases.get(errorName);
    if (errorCase && this.validateShowWhen(errorCase)) {
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
    if (errorCase && this.validateShowWhen(errorCase)) {
      errorCase.update(error);
    }
  }

  childHasUpdate(error: ControlErrorCase<ValidatorsModel[keyof ValidatorsModel]>): void {
    this.removeError(error.error);
    this.addCase(error);
  }

  subToErrorChanges(): void {
    let differ = this.keyValueDiffers.find({}).create();
    const checkError = (errors: Partial<ValidatorsModel>) => {
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
    this.control.errors$.pipe(takeUntil(this._destroy$)).subscribe(errors => {
      this.lastErrors = errors;
      checkError(errors);
    });
    this.control.stateChanged$
      .pipe(
        takeUntil(this._destroy$),
        startWith(this.control.getState()),
        pairwise(),
        filter(([oldState, newState]) => oldState.touched !== newState.touched || oldState.dirty !== newState.dirty)
      )
      .subscribe(() => {
        differ = this.keyValueDiffers.find({}).create();
        checkError(this.lastErrors);
      });
  }

  private init(): void {
    for (const [errorName] of this._cases) {
      this.removeError(errorName);
    }
    this._destroy$.next();
    if (isID(this.controlError)) {
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
      this.control = control;
    } else {
      this.control = this.controlError;
    }
    this.subToErrorChanges();
  }

  ngOnInit(): void {
    this.init();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes.controlError && !changes.controlError.isFirstChange()) ||
      (changes.showWhen && !changes.showWhen.isFirstChange())
    ) {
      this.init();
    }
  }

  ngOnDestroy(): void {
    this._destroy$.next();
    this._destroy$.complete();
  }
}
