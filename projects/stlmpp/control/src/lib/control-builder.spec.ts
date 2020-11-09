import { ControlBuilder } from './control-builder';
import { TestBed } from '@angular/core/testing';
import { StControlModule } from './st-control.module';
import { Validators } from './validator';
import { Control } from './control';
import { ControlGroup } from './control-group';
import { ControlArray } from './control-array';

interface Group {
  control: string;
  control2: string;
  control3: { control: number };
  array: string[];
  controlObj: Control<{ control: number }>;
  controlArray: Control<string[]>;
}

describe('control builder', () => {
  let controlBuilder: ControlBuilder;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [StControlModule.forRoot()],
    });
    controlBuilder = TestBed.inject(ControlBuilder);
  });

  describe('control', () => {
    it('should create control with tuple', () => {
      const control = controlBuilder.control([
        'test',
        { updateOn: 'blur', disabled: true, validators: [Validators.required] },
      ]);
      expect(control.disabled).toBeTrue();
      expect(control.updateOn).toBe('blur');
      expect(control.validators.length).toBe(1);
    });

    it('should create from value', () => {
      const control = controlBuilder.control('test', {
        updateOn: 'blur',
        disabled: true,
        validators: [Validators.required],
      });
      expect(control.disabled).toBeTrue();
      expect(control.updateOn).toBe('blur');
      expect(control.validators.length).toBe(1);
    });
  });

  describe('group', () => {
    it('should create group', () => {
      const group = controlBuilder.group<Group>({
        control: ['TESTE', { validators: [Validators.required], updateOn: 'blur' }],
        control2: '',
        control3: { control: [0, { validators: [Validators.required] }] },
        array: controlBuilder.array<string>([]),
        controlArray: controlBuilder.control([['', ''], { validators: [Validators.required] }]),
        controlObj: controlBuilder.control([{ control: 1 }, { validators: [Validators.required] }]),
      });
      expect(group).toBeDefined();
      const { control, control2, control3, array, controlArray, controlObj } = group.controls;
      expect(control).toBeInstanceOf(Control);
      expect(control.validators.length).toBe(1);
      expect(control.updateOn).toBe('blur');
      expect(control2).toBeInstanceOf(Control);
      expect(control2.validators.length).toBe(0);
      expect(control2.updateOn).toBe('change');
      expect(control3).toBeInstanceOf(ControlGroup);
      expect(control3.get('control')).toBeInstanceOf(Control);
      expect(control3.get('control').value).toBe(0);
      expect(control3.get('control').validators.length).toBe(1);
      expect(array).toBeInstanceOf(ControlArray);
      expect(array.length).toBe(0);
      expect(controlArray).toBeInstanceOf(Control);
      expect(controlObj).toBeInstanceOf(Control);
    });
  });

  describe('array', () => {
    it('should create empty array', () => {
      expect(controlBuilder.array([])).toBeInstanceOf(ControlArray);
    });

    it('should create array', () => {
      const array = controlBuilder.array<Group>(
        [
          {
            control: ['TESTE', { validators: [Validators.required], updateOn: 'blur' }],
            control2: '',
            control3: { control: [0, { validators: [Validators.required] }] },
            array: controlBuilder.array<string>([]),
            controlArray: controlBuilder.control([['', ''], { validators: [Validators.required] }]),
            controlObj: controlBuilder.control([{ control: 1 }, { validators: [Validators.required] }]),
          },
        ],
        { updateOn: 'blur' }
      );
      expect(array).toBeInstanceOf(ControlArray);
      expect(array.get(0)).toBeInstanceOf(ControlGroup);
    });

    it('should create from control / group / array instance', () => {
      const array = controlBuilder.array<string>([controlBuilder.control<string>()]);
      expect(array.get(0)).toBeInstanceOf(Control);
    });

    it('should create array of controls', () => {
      const array = controlBuilder.array<string>(['', '']);
      expect(array.get(0)).toBeInstanceOf(Control);
      expect(array.get(1)).toBeInstanceOf(Control);
    });
  });
});
