import { SibblingEqualsValidator } from './sibbling-equals';

export class SiblingNotEqualsValidator<T = any> extends SibblingEqualsValidator<T> {
  constructor(
    siblingName: string,
    compareWith: (valueA: T, valueB: T) => boolean = (valueA, valueB) => !Object.is(valueA, valueB)
  ) {
    super(siblingName, compareWith);
  }

  override readonly name: string = 'siblingNotEquals';
}
