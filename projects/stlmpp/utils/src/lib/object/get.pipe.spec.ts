import { GetPipe } from './get.pipe';
import { TestBed } from '@angular/core/testing';

describe('get pipe', () => {
  let pipe: GetPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [GetPipe],
    });
    pipe = TestBed.inject(GetPipe);
  });

  it('should get', () => {
    expect(pipe.transform({ id: 1 }, 'id')).toBe(1);
  });

  it('should not get if the object is undefined', () => {
    expect(pipe.transform(undefined, '')).toBeUndefined();
  });
});
