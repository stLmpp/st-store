import { GroupByPipe } from './group-by';
import { TestBed } from '@angular/core/testing';
import { IdName } from './util-test';

describe('group by', () => {
  let groupByPipe: GroupByPipe;
  let array: IdName[] = [];

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [GroupByPipe] });
    groupByPipe = TestBed.inject(GroupByPipe);
    array = [
      { id: 1, name: 'Guilherme' },
      { id: 2, name: 'Guilherme' },
      { id: 3, name: 'Other' },
      { id: 4, name: 'Other' },
    ];
  });

  it('should create the pipe', () => {
    expect(groupByPipe).toBeDefined();
  });

  it('should group by name', () => {
    const grouped = groupByPipe.transform(array, 'name');
    expect(grouped[0][0]).toBe('Guilherme');
    expect(grouped[0][1].length).toBe(2);
    expect(grouped[1][0]).toBe('Other');
    expect(grouped[1][1].length).toBe(2);
    expect(grouped[0][1][0]).toEqual({ id: 1, name: 'Guilherme' });
    expect(grouped[0][1][1]).toEqual({ id: 2, name: 'Guilherme' });
    expect(grouped[1][1][0]).toEqual({ id: 3, name: 'Other' });
    expect(grouped[1][1][1]).toEqual({ id: 4, name: 'Other' });
  });
});
