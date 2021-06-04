/**
 * @description internal class to control deep copy and deep freeze
 */
export class Environment {
  get isDev(): boolean {
    return this._isDev;
  }

  set isDev(value: boolean) {
    this._isDev = value;
  }

  get copyData(): boolean {
    return this._copyData;
  }

  set copyData(value: boolean) {
    this._copyData = value;
  }

  get freezeData(): boolean {
    return this._freezeData;
  }

  set freezeData(value: boolean) {
    this._freezeData = value;
  }

  private _isDev = true;
  private _copyData = true;
  private _freezeData = true;

  reset(): void {
    this._isDev = true;
    this._copyData = true;
    this._freezeData = true;
  }
}

export const environment = new Environment();
