import { GroupByPipe } from './group-by';
import { TestBed } from '@angular/core/testing';

describe('group by', () => {
  let groupByPipe: GroupByPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [GroupByPipe] });
    groupByPipe = TestBed.inject(GroupByPipe);
  });

  it('should create the pipe', () => {
    expect(groupByPipe).toBeDefined();
  });
});
