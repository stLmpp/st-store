import { TestBed } from '@angular/core/testing';
import { MinPipe } from './min.pipe';

describe('max pipe', () => {
  let pipe: MinPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MinPipe],
    });
    pipe = TestBed.inject(MinPipe);
  });

  it('should create the pipe', () => {
    expect(pipe).toBeDefined();
  });

  it('should return the min', () => {
    expect(pipe.transform(5, 2, 3, 4, 17, 8)).toBe(2);
  });
});
