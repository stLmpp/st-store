import {
  Directive,
  Host,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { ControlError, ControlErrorShowWhen } from './control-error';
import { ValidatorsModel } from '../validator/validators';

export class ControlErrorCaseContext<K extends keyof ValidatorsModel> {
  constructor(error: ValidatorsModel[K]) {
    this.setError(error);
  }

  $implicit!: ValidatorsModel[K];

  setError(error: ValidatorsModel[K]): this {
    this.$implicit = error;
    return this;
  }
}

@Directive({ selector: '[error]', exportAs: 'controlErrorCase' })
export class ControlErrorCase<K extends keyof ValidatorsModel> implements OnInit, OnChanges, OnDestroy {
  constructor(
    @Host() @Optional() private controlError: ControlError,
    public viewContainerRef: ViewContainerRef,
    public templateRef: TemplateRef<ControlErrorCaseContext<K>>
  ) {
    if (!controlError) {
      throw new Error('*error must be used inside a [controlError]');
    }
  }

  private readonly _context = new ControlErrorCaseContext<K>(null);
  private _hasView = false;

  @Input() error!: K;

  @Input() errorShowWhen: ControlErrorShowWhen = null;

  show(error: ValidatorsModel[K]): void {
    if (!this._hasView) {
      this.viewContainerRef.createEmbeddedView(this.templateRef, this._context.setError(error));
      this._hasView = true;
    } else {
      this._context.setError(error);
    }
  }

  remove(): void {
    this.viewContainerRef.clear();
    this._hasView = false;
  }

  update(error: ValidatorsModel[K]): void {
    this.show(error);
  }

  ngOnInit(): void {
    this.viewContainerRef.clear();
    this.controlError.addCase(this);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.errorShowWhen && !changes.errorShowWhen.isFirstChange()) {
      this.controlError.childHasUpdate(this);
    }
    if (changes.error && !changes.error.isFirstChange()) {
      this.controlError.removeCase(changes.error.previousValue);
      this.controlError.addCase(this);
    }
  }

  ngOnDestroy(): void {
    this.controlError.removeCase(this.error);
  }

  static ngTemplateContextGuard<K2 extends keyof ValidatorsModel>(
    dir: ControlErrorCase<K2>,
    ctx: unknown
  ): ctx is ControlErrorCaseContext<K2> {
    return true;
  }
}
