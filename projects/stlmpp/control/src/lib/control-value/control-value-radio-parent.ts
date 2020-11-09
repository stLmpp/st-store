import { ControlValue } from './control-value';

export abstract class ControlValueRadioParent extends ControlValue {
  id!: number;
  abstract onChange(value: any): void;
}
