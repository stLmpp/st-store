import { isEmptyValue } from './util';
import { Control, isControl } from './control/control';
import { ControlGroup, isControlGroup } from './control-group/control-group';
import { ControlArray, isControlArray } from './control-array/control-array';
import { isAnyControl } from './is-any-control';

describe('utils', () => {
  it('should check whether the control value is empty', () => {
    expect(isEmptyValue('')).toBeTrue();
    expect(isEmptyValue({})).toBeFalse();
    expect(isEmptyValue([])).toBeFalse();
    expect(isEmptyValue(null)).toBeTrue();
    expect(isEmptyValue(undefined)).toBeTrue();
  });

  it('should check if is control', () => {
    expect(isControl(new Control(''))).toBeTrue();
    expect(isControl(new ControlGroup({}))).toBeFalse();
    expect(isControl(new ControlArray([]))).toBeFalse();
    expect(isControl(1)).toBeFalse();
    expect(isControl('')).toBeFalse();
    expect(isControl({})).toBeFalse();
    expect(isControl([])).toBeFalse();
    expect(isControl(null)).toBeFalse();
    expect(isControl(undefined)).toBeFalse();
  });

  it('should check if is control group', () => {
    expect(isControlGroup(new Control(''))).toBeFalse();
    expect(isControlGroup(new ControlGroup({}))).toBeTrue();
    expect(isControlGroup(new ControlArray([]))).toBeFalse();
    expect(isControlGroup(1)).toBeFalse();
    expect(isControlGroup('')).toBeFalse();
    expect(isControlGroup({})).toBeFalse();
    expect(isControlGroup([])).toBeFalse();
    expect(isControlGroup(null)).toBeFalse();
    expect(isControlGroup(undefined)).toBeFalse();
  });

  it('should check if is control array', () => {
    expect(isControlArray(new Control(''))).toBeFalse();
    expect(isControlArray(new ControlGroup({}))).toBeFalse();
    expect(isControlArray(new ControlArray([]))).toBeTrue();
    expect(isControlArray(1)).toBeFalse();
    expect(isControlArray('')).toBeFalse();
    expect(isControlArray({})).toBeFalse();
    expect(isControlArray([])).toBeFalse();
    expect(isControlArray(null)).toBeFalse();
    expect(isControlArray(undefined)).toBeFalse();
  });

  it('should check if is any control', () => {
    expect(isAnyControl(new Control(''))).toBeTrue();
    expect(isAnyControl(new ControlGroup({}))).toBeTrue();
    expect(isAnyControl(new ControlArray([]))).toBeTrue();
    expect(isAnyControl(1)).toBeFalse();
    expect(isAnyControl('')).toBeFalse();
    expect(isAnyControl({})).toBeFalse();
    expect(isAnyControl([])).toBeFalse();
    expect(isAnyControl(null)).toBeFalse();
    expect(isAnyControl(undefined)).toBeFalse();
  });
});
