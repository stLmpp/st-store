import { sumByOperator, SumByPipe, sumOperator, SumPipe } from './sum';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

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

    it('should sum', () => {
      expect(sumPipe.transform([1, 2, 3, 4])).toBe(10);
      expect(sumPipe.transform(undefined as any)).toBe(0);
      expect(sumPipe.transform([])).toBe(0);
      expect(sumPipe.transform([1, 2, 3, 4, undefined as any])).toBe(10);
    });

    it('should pipe sum', () => {
      of([1, 2, 3, 4])
        .pipe(sumOperator())
        .subscribe(sum => expect(sum).toBe(10));
      of(undefined as any)
        .pipe(sumOperator())
        .subscribe(sum => expect(sum).toBe(0));
      of([])
        .pipe(sumOperator())
        .subscribe(sum => expect(sum).toBe(0));
      of([1, 2, 3, 4, undefined as any])
        .pipe(sumOperator())
        .subscribe(sum => expect(sum).toBe(10));
    });
  });

  describe('sum by', () => {
    let sumByPipe: SumByPipe;

    let array: { id: number; value: number }[];

    beforeEach(() => {
      TestBed.configureTestingModule({ providers: [SumByPipe] });
      sumByPipe = TestBed.inject(SumByPipe);
      array = [
        { id: 1, value: 1 },
        { id: 2, value: 2 },
      ];
    });

    it('should create the pipe', () => {
      expect(sumByPipe).toBeDefined();
    });

    it('should sum by value', () => {
      expect(sumByPipe.transform(array, 'value')).toBe(3);
    });

    it('should sum by multiple keys', () => {
      expect(sumByPipe.transform(array, ['id', 'value'])).toBe(6);
    });

    it('should not sum if undefined or null', () => {
      expect(
        sumByPipe.transform(
          [
            { id: 1, value: null },
            { id: 2, value: undefined },
          ],
          'value'
        )
      ).toBe(0);
    });

    it('should not sum if empty or undefined', () => {
      const newArray = [
        { id: 1, value: null },
        { id: 2, value: undefined },
      ];
      expect(sumByPipe.transform([], 'value')).toBe(0);
      expect(sumByPipe.transform(undefined as any, 'value')).toBe(0);
      expect(sumByPipe.transform(newArray, ['id', 'value'])).toBe(3);
      expect(sumByPipe.transform(array, [])).toBe(0);
      expect(sumByPipe.transform(array, undefined as any)).toBe(0);
    });

    it('should pipe sum by', () => {
      of(array)
        .pipe(sumByOperator('value'))
        .subscribe(sum => expect(sum).toBe(3));
    });
  });
});
