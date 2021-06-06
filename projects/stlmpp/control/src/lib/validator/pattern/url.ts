import { AbstractPatternValidator } from './pattern';

export class AbstractUrlValidator extends AbstractPatternValidator {
  constructor() {
    super();
    this.pattern = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
  }

  readonly name = 'url';
}

export class UrlValidator extends AbstractUrlValidator {}
