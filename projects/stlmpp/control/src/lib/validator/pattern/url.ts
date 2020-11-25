import { AbstractPatternValidator } from './pattern';

export class AbstractUrlValidator extends AbstractPatternValidator {
  constructor() {
    super();
    this.name = 'url';
    this.pattern = '(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?';
  }
}

export class UrlValidator extends AbstractUrlValidator {}
