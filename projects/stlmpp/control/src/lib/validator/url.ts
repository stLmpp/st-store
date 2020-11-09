import { PatternValidator } from './pattern';

export class UrlValidator extends PatternValidator {
  constructor() {
    super('(https?://)?([\\da-z.-]+)\\.([a-z.]{2,6})[/\\w .-]*/?');
    this.name = 'url';
  }
}
