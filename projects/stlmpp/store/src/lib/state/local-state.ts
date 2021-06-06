import { Directive, OnChanges, OnDestroy } from '@angular/core';
import { isKeyof, isObjectEmpty } from 'st-utils';
import { SimpleChangesCustom, StateComponentConfig, StateComponentConfigInput } from '../type';
import { State } from './state';

/** @dynamic */
@Directive()
export abstract class LocalState<T extends Record<string, any> = Record<string, any>>
  extends State<T>
  implements OnChanges, OnDestroy
{
  /**
   * @template T
   * @description calling super is required, because it will initialize the inputs
   * @param {T} initialState
   * @param {StateComponentConfig<T>} config
   * @protected
   */
  protected constructor(initialState: T, config: StateComponentConfig<T> = {}) {
    super(initialState, config);
    this._inputs = (config.inputs ?? []).map(keyOrConfig =>
      isKeyof<T, keyof T>(keyOrConfig) ? { key: keyOrConfig, transformer: value => value } : keyOrConfig
    );
  }

  private readonly _inputs: StateComponentConfigInput<T>[];

  /**
   * @description used to synchronize the inputs of the Component/Directive, don't forget to call super
   * @param {SimpleChangesCustom} changes
   */
  ngOnChanges(changes: SimpleChangesCustom): void {
    if (!this._inputs.length) {
      return;
    }
    let stateUpdate: Partial<T> = {};
    for (const { key, transformer } of this._inputs) {
      const inputChanges = changes[key];
      if (inputChanges && inputChanges.currentValue !== inputChanges.previousValue) {
        stateUpdate = { ...stateUpdate, [key]: transformer(inputChanges.currentValue) };
      }
    }
    if (!isObjectEmpty(stateUpdate)) {
      this.updateState(stateUpdate);
    }
  }

  ngOnDestroy(): void {
    this.destroy();
  }
}
