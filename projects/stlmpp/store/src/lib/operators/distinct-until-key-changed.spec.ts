import { BehaviorSubject } from 'rxjs';
import { IdName } from '../util-test';
import { distinctUntilKeysChanged } from '../../public-api';

describe('distinct until keys changed', () => {
  const state$ = new BehaviorSubject<IdName>({ id: 1, name: 'Guilherme' });

  it('should distinct', () => {
    const spy = jasmine.createSpy();
    state$.pipe(distinctUntilKeysChanged(['id'])).subscribe(spy);
    expect(spy).toHaveBeenCalledTimes(1);
    state$.next({ id: 1, name: '1' });
    expect(spy).toHaveBeenCalledTimes(1);
    state$.next({ id: 2, name: '1' });
    expect(spy).toHaveBeenCalledTimes(2);
  });
});
