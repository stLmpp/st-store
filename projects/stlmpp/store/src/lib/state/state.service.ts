import { Injectable } from '@angular/core';
import { StateConfig } from '../type';
import { isString } from 'st-utils';
import { State } from './state';

@Injectable()
export class StateService {
  private _states = new Map<string, State<any>>();

  private _id = 0;

  private _getUniqueName(): string {
    let name = 'ST-STATE-' + this._id++;
    while (this._states.has(name)) {
      name = 'ST-STATE-' + this._id++;
    }
    return name;
  }

  create<T extends Record<any, any> = Record<any, any>>(initialState: T, config: StateConfig = {}): State<T> {
    config.name ??= this._getUniqueName();
    const state = new State<T>(initialState, config, this);
    this._states.set(config.name, state);
    return state;
  }

  get<T extends Record<any, any> = Record<any, any>>(name: string): State<T> | undefined {
    return this._states.get(name);
  }

  destroy(nameOrState: string | State<any>): void {
    const state: State<any> | undefined = isString(nameOrState) ? this._states.get(nameOrState) : nameOrState;
    if (state) {
      this._states.delete(state.name!);
      state.destroyInternal();
    }
  }
}
