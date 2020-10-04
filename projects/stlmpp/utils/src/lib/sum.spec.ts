import { SumPipe } from './sum';
import { TestBed } from '@angular/core/testing';

describe('sum', () => {
  describe('sum', () => {
    let sumPipe: SumPipe;

    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [SumPipe] });
      sumPipe = TestBed.inject(SumPipe);
    });

    it('should create the pipe', () => {
      expect(sumPipe).toBeDefined();
    });
  });
});
