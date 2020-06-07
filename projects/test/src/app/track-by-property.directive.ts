import { Directive, Host, Input } from '@angular/core';
import { NgForOf } from '@angular/common';
import { trackByFactory } from '../../../stlmpp/utils/src/lib/track-by';

// tslint:disable-next-line:directive-selector
@Directive({ selector: '[ngForTrackByProperty]' })
export class TrackByPropertyDirective<T = any> {
  @Input() ngForTrackByProperty: keyof T;

  constructor(@Host() private ngForOf: NgForOf<T>) {
    this.ngForOf.ngForTrackBy = trackByFactory(this.ngForTrackByProperty);
  }
}
