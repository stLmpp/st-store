import { JoinPipe } from './join.pipe';
import { IdName } from '../util-test';
import { TestBed } from '@angular/core/testing';

describe('join pipe', () => {
  let pipe: JoinPipe;
  let array1: number[] = [];
  let array2: IdName[] = [];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [JoinPipe],
    });
    pipe = TestBed.inject(JoinPipe);
    array1 = [1, 2, 3];
    array2 = [
      { id: 1, name: '1' },
      { id: 2, name: '2' },
      { id: 3, name: '3' },
    ];
  });

  it('should create the pipe', () => {
    expect(pipe).toBeDefined();
  });

  it('should join without key', () => {
    expect(pipe.transform(array1)).toBe('1, 2, 3');
  });

  it('should join with key', () => {
    expect(pipe.transform(array2, 'id')).toBe('1, 2, 3');
  });

  it('should use the custom char to join', () => {
    expect(pipe.transform(array1, '.', '.')).toBe('1.2.3');
  });
});
