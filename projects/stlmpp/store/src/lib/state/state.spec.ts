import { State } from './state';
import { IdName } from '../util-test';
import { asyncScheduler } from 'rxjs';

describe('state', () => {
  let state: State<IdName>;

  beforeEach(() => {
    state = new State<IdName>({ id: 1, name: '1' });
  });

  it('should create the state', () => {
    expect(state).toBeDefined();
  });

  it('should update the state (partial)', () => {
    state.updateState({ name: '2' });
    expect(state.getState('name')).toBe('2');
  });

  it('should update the state (callback)', () => {
    state.updateState(oldState => ({ ...oldState, name: '3' }));
    expect(state.getState('name')).toBe('3');
  });

  it('should update the state (key value)', () => {
    state.updateState('name', '4');
    expect(state.getState('name')).toBe('4');
  });

  it('should update the state (key value callback)', () => {
    state.updateState('name', name => name + '1');
    expect(state.getState('name')).toBe('11');
  });

  it('should change the scheduler', done => {
    const asyncState = new State<IdName>({ name: '1', id: 1 }, { scheduler: asyncScheduler });
    asyncState.updateState({ name: '2' });
    expect(asyncState.getState('name')).toBe('1');
    setTimeout(() => {
      expect(asyncState.getState('name')).toBe('2');
      done();
    });
  });

  it('should select state', () => {
    const spy = jasmine.createSpy();
    state.selectState().subscribe(spy);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({ id: 1, name: '1' });
    state.updateState({ name: '2' });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith({ id: 1, name: '2' });
  });

  it('should select state (key)', () => {
    const spy = jasmine.createSpy();
    state.selectState('name').subscribe(spy);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith('1');
    state.updateState({ name: '2' });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith('2');
    state.updateState({ id: 3 });
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should select state (keys)', () => {
    const spy = jasmine.createSpy();
    state.selectState(['name']).subscribe(spy);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith({ name: '1' });
    state.updateState({ name: '2' });
    expect(spy).toHaveBeenCalledTimes(2);
    expect(spy).toHaveBeenCalledWith({ name: '2' });
    state.updateState({ id: 3 });
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should get state', () => {
    expect(state.getState()).toEqual({ id: 1, name: '1' });
  });

  it('should get state (key)', () => {
    expect(state.getState('name')).toBe('1');
  });

  it('should destroy the state', () => {
    state.destroy();
    const spy = jasmine.createSpy('state');
    state.selectState().subscribe(spy);
    expect(spy).not.toHaveBeenCalled();
    state.updateState({ id: 3 });
    expect(state.getState()).toEqual({ id: 1, name: '1' });
  });
});
