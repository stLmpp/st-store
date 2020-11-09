import { ControlParent } from './control-parent';

export abstract class ControlChild {
  controlParent!: ControlParent;
  abstract init(): void;
}
