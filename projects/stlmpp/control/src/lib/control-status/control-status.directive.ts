import { Directive, HostBinding, Self } from '@angular/core';
import { AbstractControlDirective } from '../abstract-control';

@Directive({
  selector: `
    [control],[controlName],
    :not(ng-container):not(ng-template)[controlGroup],:not(ng-container):not(ng-template)[controlGroupName],
    :not(ng-container):not(ng-template)[controlArrayName],
    [model]
  `,
})
export class ControlStatusDirective {
  constructor(@Self() private abstractControlDirective: AbstractControlDirective) {}

  @HostBinding('class.is-invalid')
  @HostBinding('attr.aria-invalid')
  get isInvalid(): boolean {
    return this.abstractControlDirective.isInvalid;
  }

  @HostBinding('class.is-valid')
  get isValid(): boolean {
    return this.abstractControlDirective.isValid;
  }

  @HostBinding('class.is-pristine')
  get isPristine(): boolean {
    return this.abstractControlDirective.isPristine;
  }

  @HostBinding('class.is-dirty')
  get isDirty(): boolean {
    return this.abstractControlDirective.isDirty;
  }

  @HostBinding('class.is-touched')
  get isTouched(): boolean {
    return this.abstractControlDirective.isTouched;
  }

  @HostBinding('class.is-untouched')
  get isUntouched(): boolean {
    return this.abstractControlDirective.isUntouched;
  }

  @HostBinding('class.is-pending')
  get isPending(): boolean {
    return this.abstractControlDirective.isPending;
  }

  @HostBinding('class.is-disabled')
  @HostBinding('attr.aria-disabled')
  get isDisabled(): boolean {
    return this.abstractControlDirective.isDisabled;
  }
}
