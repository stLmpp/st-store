import { ControlValidator } from '../validator';
import { Control } from '../../control/control';
import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';

@Directive()
export abstract class AbstractContainsValidators
  extends ControlValidator<string | null | undefined, boolean>
  implements OnChanges
{
  @Input() contains!: string;

  readonly name = 'contains';

  validate({ value }: Control<string | null | undefined>): boolean | null {
    if (!value) {
      return null;
    }
    return !value.includes(this.contains) || null;
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { contains } = changes;
    if (contains && !contains.isFirstChange()) {
      this.validationChange$.next();
    }
  }
}

export class ContainsValidator extends AbstractContainsValidators {
  constructor(contains: string) {
    super();
    this.contains = contains;
  }
}
