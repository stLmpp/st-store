import { Environment } from './environment';

describe('Environment', () => {
  let env: Environment;

  beforeEach(() => {
    env = new Environment();
  });

  it('should set default values', () => {
    expect(env.isDev).toBeTrue();
    expect(env.freezeData).toBeTrue();
    expect(env.copyData).toBeTrue();
  });

  it('should set dev', () => {
    env.isDev = false;
    expect(env.isDev).toBeFalse();
  });

  it('should set copyData', () => {
    env.copyData = false;
    expect(env.copyData).toBeFalse();
  });

  it('should set freezeData', () => {
    env.freezeData = false;
    expect(env.freezeData).toBeFalse();
  });
});
