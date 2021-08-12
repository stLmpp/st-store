import { SearchPipe } from './search.pipe';
import { TestBed } from '@angular/core/testing';

describe('SearchPipe', () => {
  let pipe: SearchPipe;
  const array = [
    { id: 1, name: 'This is text number one' },
    { id: 2, name: 'Another text, will be number two' },
    { id: 3, name: 'Yet, this is number three' },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [SearchPipe],
    });
    pipe = TestBed.inject(SearchPipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeDefined();
  });

  it('should search with key', () => {
    expect(pipe.transform(array, 'name', 'one')).toEqual([{ id: 1, name: 'This is text number one' }]);
  });

  it('should search with multiple keys', () => {
    expect(pipe.transform(array, ['id', 'name'], '2')).toEqual([{ id: 2, name: 'Another text, will be number two' }]);
  });

  it('should search with callback', () => {
    expect(pipe.transform(array, entity => entity.name, 'three')).toEqual([
      { id: 3, name: 'Yet, this is number three' },
    ]);
  });
});
