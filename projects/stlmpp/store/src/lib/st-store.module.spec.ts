import { environment } from './environment';
import { TestBed } from '@angular/core/testing';
import { StStoreModule } from './st-store.module';

describe('StStore Module', () => {
  beforeEach(() => {
    environment.reset();
  });

  afterAll(() => {
    environment.reset();
  });

  it('should have set default values', () => {
    TestBed.configureTestingModule({ imports: [StStoreModule.forRoot()] });
    expect(environment.isDev).toBeTrue();
    expect(environment.freezeData).toBeTrue();
    expect(environment.copyData).toBeTrue();
  });

  it('should set options', () => {
    TestBed.configureTestingModule({
      imports: [StStoreModule.forRoot({ production: true, freezeData: false, copyData: false })],
    });
    expect(environment.isDev).toBeFalse();
    expect(environment.freezeData).toBeFalse();
    expect(environment.copyData).toBeFalse();
  });
});
