import { DefaultPipe } from './default';

describe('Default Pipe', () => {
  let pipe: DefaultPipe;

  it('should create pipe', () => {
    pipe = new DefaultPipe('strict');
    expect(pipe).toBeDefined();
  });

  it('should return default value (strict)', () => {
    pipe = new DefaultPipe('strict');
    const value1 = undefined;
    const value2 = 0;
    const value1Alt = null;
    expect(pipe.transform(value1, value2)).toBe(0);
    expect(pipe.transform(value1Alt, value2)).toBe(0);
  });

  it('should return original value (strict)', () => {
    pipe = new DefaultPipe('strict');
    const value1 = 0;
    const value2 = 1;
    const value1Alt = '';
    expect(pipe.transform(value1, value2)).toBe(0);
    expect(pipe.transform(value1Alt, value2)).toBe('');
  });

  it('should return default value (loose)', () => {
    pipe = new DefaultPipe('loose');
    const value1 = undefined;
    const value2 = 0;
    const value1Alt = null;
    expect(pipe.transform(value1, value2)).toBe(0);
    expect(pipe.transform(value1Alt, value2)).toBe(0);
  });

  it('should return original value (strict)', () => {
    pipe = new DefaultPipe('loose');
    const value1 = 0;
    const value2 = 1;
    const value1Alt = '';
    expect(pipe.transform(value1, value2)).toBe(1);
    expect(pipe.transform(value1Alt, value2)).toBe(1);
  });
});
