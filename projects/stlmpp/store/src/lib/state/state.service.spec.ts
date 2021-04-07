import { StateService } from './state.service';
import { TestBed } from '@angular/core/testing';
import { StStoreModule } from '../st-store.module';
import { IdName } from '../util-test';
import { State } from './state';

describe('state service', () => {
  let stateService: StateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StStoreModule.forRoot()],
    });
    stateService = TestBed.inject(StateService);
  });

  it('should create the service', () => {
    expect(stateService).toBeDefined();
  });

  it('should create a state', () => {
    const state = stateService.create<IdName>({ id: 1, name: '1' });
    expect(state).toBeDefined();
    expect(state).toBeInstanceOf(State);
    expect(state.getState()).toEqual({ id: 1, name: '1' });
    expect(state.name).toContain('ST-STATE');
  });

  it('should create a unique state name', () => {
    const state1 = stateService.create<{ id: number }>({ id: 1 }, { name: 'ST-STATE-0' });
    const state2 = stateService.create<IdName>({ id: 1, name: '1' });
    expect(state1.name).not.toBe(state2.name);
  });

  it('should get the state', () => {
    stateService.create<IdName>({ name: '1', id: 1 }, { name: 'state' });
    const state = stateService.get('state');
    expect(state).toBeDefined();
    expect(stateService.get('NOT EXISTS')).toBeUndefined();
  });

  it('should destroy and remove the state', () => {
    const state = stateService.create<IdName>({ name: '1', id: 1 });
    stateService.destroy(state);
    expect(stateService.get(state.name!)).toBeUndefined();
  });

  it('should destroy and remove the state (name)', () => {
    const state = stateService.create<IdName>({ name: '1', id: 1 });
    stateService.destroy(state.name!);
    expect(stateService.get(state.name!)).toBeUndefined();
  });

  it('should do nothing when trying to destroy a non-existent state', () => {
    stateService.destroy('NOT EXISTS');
    expect(stateService.get('NOT EXISTS')).toBeUndefined();
  });

  it('should destroy and remove the state (within)', () => {
    const state = stateService.create<IdName>({ name: '1', id: 1 });
    expect(stateService.get(state.name!)).toBeDefined();
    state.destroy();
    expect(stateService.get(state.name!)).toBeUndefined();
  });
});
