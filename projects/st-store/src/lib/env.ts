export let isDev = true;

export function enableProd(): void {
  isDev = false;
}
