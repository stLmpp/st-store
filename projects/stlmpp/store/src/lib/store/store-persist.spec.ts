import { StorePersistLocalStorageStrategy } from './store-persist';

describe('Store Persist', () => {
  let localStorageStrategy: StorePersistLocalStorageStrategy<any>;
  let store: Record<string, string> = {};

  beforeEach(() => {
    store = {};

    const fakeLocalStorage = {
      getItem(key: string): string | null {
        return store[key];
      },
      setItem(key: string, value: string): void {
        store[key] = value;
      },
      clear(): void {
        store = {};
      },
      removeItem(key: string): void {
        delete store[key];
      },
    };

    spyOn(localStorage, 'getItem').and.callFake(fakeLocalStorage.getItem);
    spyOn(localStorage, 'setItem').and.callFake(fakeLocalStorage.setItem);
    spyOn(localStorage, 'clear').and.callFake(fakeLocalStorage.clear);
    spyOn(localStorage, 'removeItem').and.callFake(fakeLocalStorage.removeItem);

    localStorageStrategy = new StorePersistLocalStorageStrategy();
    localStorageStrategy.set('1', localStorageStrategy.serialize(1));
  });

  it('should get', () => {
    expect(localStorageStrategy.get('1')).toBe('1');
  });

  it('should remove', () => {
    localStorageStrategy.set('1', undefined);
    expect(localStorageStrategy.get('1')).toBeUndefined();
  });

  it('should get from store', () => {
    expect(localStorageStrategy.getStore({ id: 1 }, 'id')).toBe(1);
  });

  it('should serialize', () => {
    expect(localStorageStrategy.serialize(1)).toBe('1');
    expect(localStorageStrategy.serialize('1')).toBe('"1"');
    expect(localStorageStrategy.serialize(undefined)).toBe(undefined);
  });

  it('should deserialize', () => {
    expect(localStorageStrategy.deserialize('1')).toBe(1);
    expect(localStorageStrategy.deserialize('"1"')).toBe('1');
    expect(localStorageStrategy.deserialize(undefined)).toBe(undefined);
  });

  it('should set store', () => {
    const value = localStorageStrategy.get('1');
    expect(localStorageStrategy.setStore({ id: 2 }, localStorageStrategy.deserialize('1'), 'id')).toEqual({ id: 1 });
  });
});
