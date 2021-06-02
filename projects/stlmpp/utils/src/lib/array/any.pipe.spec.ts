import { TestBed } from '@angular/core/testing';
import { AnyPipe } from './any.pipe';

describe('group by', () => {
  let pipe: AnyPipe;
  let array: number[] = [];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [AnyPipe] });
    pipe = TestBed.inject(AnyPipe);
    array = [1, 2, 3];
  });

  it('should create the pipe', () => {
    expect(pipe).toBeDefined();
  });

  it('should check if any value matches', () => {
    expect(pipe.transform(1, array)).toBeTrue();
    expect(pipe.transform(2, array)).toBeTrue();
    expect(pipe.transform(3, array)).toBeTrue();
    expect(pipe.transform(4, array)).toBeFalse();
    expect(pipe.transform(5, array)).toBeFalse();
    expect(pipe.transform(6, array)).toBeFalse();
  });
});
