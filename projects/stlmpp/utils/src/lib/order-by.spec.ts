import { OrderByPipe } from './order-by';
import { TestBed } from '@angular/core/testing';

describe('order by', () => {
  let orderByPipe: OrderByPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [OrderByPipe] });
    orderByPipe = TestBed.inject(OrderByPipe);
  });

  it('should create the pipe', () => {
    expect(orderByPipe).toBeDefined();
  });
});
