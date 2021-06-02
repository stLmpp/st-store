import { MaxPipe } from './max.pipe';
import { TestBed } from '@angular/core/testing';

describe('max pipe', () => {
  let pipe: MaxPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [MaxPipe],
    });
    pipe = TestBed.inject(MaxPipe);
  });

  it('should create the pipe', () => {
    expect(pipe).toBeDefined();
  });

  it('should return the max', () => {
    expect(pipe.transform(5, 2, 3, 4, 17, 8)).toBe(17);
  });
});
