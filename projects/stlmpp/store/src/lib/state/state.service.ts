import { Injectable } from '@angular/core';
import { StateConfig } from '../type';
import { isString } from 'st-utils';
import { State } from './state';

/**
 * @description service used to create and manage states
 */
@Injectable({ providedIn: 'root' })
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

  /**
   * @description creates a new instance of {@link State}
   * @param {T} initialState
   * @param {StateConfig} config
   * @returns {State<T>}
   */
  create<T extends Record<any, any> = Record<any, any>>(initialState: T, config: StateConfig = {}): State<T> {
    config.name ??= this._getUniqueName();
    const state = new State<T>(initialState, config, this);
    this._states.set(config.name, state);
    return state;
  }

  /**
   * @description gets a state instance {@link State}
   * @param {string} name
   * @returns {State<T> | undefined}
   */
  get<T extends Record<any, any> = Record<any, any>>(name: string): State<T> | undefined {
    return this._states.get(name);
  }

  /**
   * @description destroy a state {@link State}
   * @param {string | State} nameOrState
   */
  destroy(nameOrState: string | State<any>): void {
    const state: State<any> | undefined = isString(nameOrState) ? this._states.get(nameOrState) : nameOrState;
    if (state) {
      this._states.delete(state.name!);
      state.destroyInternal();
    }
  }
}
