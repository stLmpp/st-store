import { orderBy, orderByOperator, OrderByPipe } from './order-by';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

describe('order by', () => {
  let orderByPipe: OrderByPipe;

  let array: { id: number; name: string; nested: { id: number } }[];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [OrderByPipe] });
    orderByPipe = TestBed.inject(OrderByPipe);
    array = [
      { id: 3, name: 'B', nested: { id: 5 } },
      { id: 1, name: 'Guilherme', nested: { id: 1 } },
      { id: 2, name: 'Guilherme', nested: { id: 2 } },
      { id: 0, name: 'B', nested: { id: 4 } },
      { id: 3, name: 'A', nested: { id: 5 } },
    ];
  });

  it('should create the pipe', () => {
    expect(orderByPipe).toBeDefined();
  });

  it('should order by key', () => {
    const ordered = orderByPipe.transform(array, 'id');
    expect(ordered[0]).toEqual(array[3]);
    expect(ordered[1]).toEqual(array[1]);
    expect(ordered[2]).toEqual(array[2]);
    expect(ordered[3]).toEqual(array[0]);
    expect(ordered[4]).toEqual(array[4]);
  });

  it('should order by multiple key', () => {
    const ordered = orderByPipe.transform(array, ['id', 'name']);
    expect(ordered[0]).toEqual(array[3]);
    expect(ordered[1]).toEqual(array[1]);
    expect(ordered[2]).toEqual(array[2]);
    expect(ordered[3]).toEqual(array[4]);
    expect(ordered[4]).toEqual(array[0]);
  });

  it('should order by nested', () => {
    const ordered = orderByPipe.transform(array, 'nested.id');
    expect(ordered[0]).toEqual(array[1]);
    expect(ordered[1]).toEqual(array[2]);
    expect(ordered[2]).toEqual(array[3]);
    expect(ordered[3]).toEqual(array[0]);
    expect(ordered[4]).toEqual(array[4]);
    const ordered2 = orderByPipe.transform(array, ['nested.id', 'name']);
    expect(ordered2[0]).toEqual(array[1]);
    expect(ordered2[1]).toEqual(array[2]);
    expect(ordered2[2]).toEqual(array[3]);
    expect(ordered2[3]).toEqual(array[4]);
    expect(ordered2[4]).toEqual(array[0]);
  });

  it('should return original array', () => {
    const newArray: any[] = [];
    expect(orderByPipe.transform(newArray)).toBe(newArray);
    expect(orderByPipe.transform(undefined as any)).toBeUndefined();
    expect(orderByPipe.transform(newArray, undefined, undefined)).toBe(newArray);
  });

  it('should sort without key', () => {
    expect(orderByPipe.transform(array.map(o => o.id))).toEqual([0, 1, 2, 3, 3]);
    expect(
      orderByPipe.transform(
        array.map(o => o.id),
        undefined,
        'desc'
      )
    ).toEqual([3, 3, 2, 1, 0]);
  });

  it('should sort with function', () => {
    const ordered = orderByPipe.transform(array, item => item.nested.id);
    expect(ordered[0]).toEqual(array[1]);
    expect(ordered[1]).toEqual(array[2]);
    expect(ordered[2]).toEqual(array[3]);
    expect(ordered[3]).toEqual(array[0]);
    expect(ordered[4]).toEqual(array[4]);
  });

  it('should sort with object', () => {
    const ordered = orderByPipe.transform(array, { id: 'asc', name: 'desc' });
    expect(ordered[0]).toEqual(array[3]);
    expect(ordered[1]).toEqual(array[1]);
    expect(ordered[2]).toEqual(array[2]);
    expect(ordered[3]).toEqual(array[0]);
    expect(ordered[4]).toEqual(array[4]);
  });

  it('should pipe order', () => {
    of(array)
      .pipe(orderByOperator('id'))
      .subscribe(ordered => {
        expect(ordered[0]).toEqual(array[3]);
        expect(ordered[1]).toEqual(array[1]);
        expect(ordered[2]).toEqual(array[2]);
        expect(ordered[3]).toEqual(array[0]);
        expect(ordered[4]).toEqual(array[4]);
      });
    of(array)
      .pipe(orderByOperator('id', 'desc'))
      .subscribe(ordered => {
        expect(ordered[0]).toEqual(array[0]);
        expect(ordered[1]).toEqual(array[4]);
        expect(ordered[2]).toEqual(array[2]);
        expect(ordered[3]).toEqual(array[1]);
        expect(ordered[4]).toEqual(array[3]);
      });
  });

  it('should have asc as default order direction', () => {
    const ordered = orderBy(array, 'id');
    expect(ordered[0]).toEqual(array[3]);
    expect(ordered[1]).toEqual(array[1]);
    expect(ordered[2]).toEqual(array[2]);
    expect(ordered[3]).toEqual(array[0]);
    expect(ordered[4]).toEqual(array[4]);
  });
});
