export let _isDev = true;

export function isDev(): boolean {
  return _isDev;
}

export function enableProd(): void {
  _isDev = false;
}
