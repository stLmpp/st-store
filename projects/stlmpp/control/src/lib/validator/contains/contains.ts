import { ControlValidator } from '../validator';
import { Control } from '../../control/control';
import { Directive, Input, OnChanges, SimpleChanges } from '@angular/core';
import { Nullable } from '../../util';

@Directive()
export abstract class AbstractContainsValidators
  extends ControlValidator<Nullable<string>, boolean>
  implements OnChanges
{
  @Input() contains!: string;

  readonly name = 'contains';

  validate({ value }: Control<Nullable<string>>): boolean | null {
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
  constructor(public contains: string) {
    super();
  }
}
