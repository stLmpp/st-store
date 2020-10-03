import { DEFAULT_PIPE_TYPE, DefaultPipe, DefaultPipeType } from './default';
import { TestBed } from '@angular/core/testing';
import { Provider } from '@angular/core';

describe('Default Pipe', () => {
  let pipe: DefaultPipe;

  const provide = (type?: DefaultPipeType) => {
    const providers: Provider[] = [DefaultPipe];
    if (type) {
      providers.push({ provide: DEFAULT_PIPE_TYPE, useValue: type });
    }
    TestBed.configureTestingModule({ providers });
    pipe = TestBed.inject(DefaultPipe);
  };

  it('should create pipe', () => {
    provide('strict');
    expect(pipe).toBeDefined();
  });

  it('should return default value (strict)', () => {
    provide('strict');
    const value1 = undefined;
    const value2 = 0;
    const value1Alt = null;
    expect(pipe.transform(value1, value2)).toBe(0);
    expect(pipe.transform(value1Alt, value2)).toBe(0);
  });

  it('should return original value (strict)', () => {
    provide('strict');
    const value1 = 0;
    const value2 = 1;
    const value1Alt = '';
    expect(pipe.transform(value1, value2)).toBe(0);
    expect(pipe.transform(value1Alt, value2)).toBe('');
  });

  it('should return default value (loose)', () => {
    provide('loose');
    const value1 = undefined;
    const value2 = 0;
    const value1Alt = null;
    expect(pipe.transform(value1, value2)).toBe(0);
    expect(pipe.transform(value1Alt, value2)).toBe(0);
  });

  it('should return original value (strict)', () => {
    provide('loose');
    const value1 = 0;
    const value2 = 1;
    const value1Alt = '';
    expect(pipe.transform(value1, value2)).toBe(1);
    expect(pipe.transform(value1Alt, value2)).toBe(1);
  });

  it('should use type from args', () => {
    provide();
    expect(pipe.transform(0, 1, 'strict')).toBe(0);
    expect(pipe.transform(0, 1, 'loose')).toBe(1);
    expect(pipe.transform(1, 0, 'loose')).toBe(1);
    expect(pipe.transform(0, 1)).toBe(0);
  });
});
