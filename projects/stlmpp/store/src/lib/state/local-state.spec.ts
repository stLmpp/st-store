import { Component, Input, SimpleChange, ViewChild } from '@angular/core';
import { LocalState } from './local-state';
import { IdName } from '../util-test';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BooleanInput, coerceBooleanProperty } from 'st-utils';

interface ComponentState extends IdName {
  flag: boolean;
}

@Component({ selector: 'test-component-local-state', template: `` })
class ComponentLocalState extends LocalState<ComponentState> {
  constructor() {
    super(
      { id: 1, name: '1', flag: false },
      { inputs: ['name', 'id', { key: 'flag', transformer: coerceBooleanProperty as any }] }
    );
  }

  @Input() id!: number;
  @Input() override name!: string;
  @Input() flag!: boolean;
  @Input() other = '';

  static ngAcceptInputType_flag: BooleanInput;
}

@Component({
  template: '<test-component-local-state [id]="id" [name]="name" flag [other]="other"></test-component-local-state>',
})
class ComponentHostLocalState {
  @ViewChild(ComponentLocalState) componentLocalState!: ComponentLocalState;

  id = 1;
  name = '1';
  other = '1';
}

@Component({ template: '' })
class ComponentLocalStateWithoutConfig extends LocalState<{ id: number }> {
  constructor() {
    super({ id: 1 });
  }
}

describe('local state', () => {
  let hostComponent: ComponentHostLocalState;
  let hostComponentFixture: ComponentFixture<ComponentHostLocalState>;
  let component: ComponentLocalState;
  let componentWithoutConfig: ComponentLocalStateWithoutConfig;
  let componentWithoutConfigFixture: ComponentFixture<ComponentLocalStateWithoutConfig>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ComponentHostLocalState, ComponentLocalState, ComponentLocalStateWithoutConfig],
    }).compileComponents();
    hostComponentFixture = TestBed.createComponent(ComponentHostLocalState);
    hostComponent = hostComponentFixture.componentInstance;
    hostComponentFixture.detectChanges();
    component = hostComponent.componentLocalState;
    componentWithoutConfigFixture = TestBed.createComponent(ComponentLocalStateWithoutConfig);
    componentWithoutConfig = componentWithoutConfigFixture.componentInstance;
  });

  it('should create the component with state', () => {
    expect(component.getState()).toEqual({ id: 1, name: '1', flag: true });
  });

  it('should update the state when the input is changed', () => {
    hostComponent.name = '2';
    hostComponentFixture.detectChanges();
    expect(component.getState('name')).toBe('2');
  });

  it('should not update the state when the input is changed', () => {
    const spy = jasmine.createSpy();
    component.selectState().subscribe(spy);
    hostComponent.other = '123';
    hostComponentFixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('should create state without config', () => {
    expect(componentWithoutConfig).toBeDefined();
    expect(componentWithoutConfig.getState()).toEqual({ id: 1 });
  });

  it(`should not update the inputs if there's not input in the list`, () => {
    const spy = jasmine.createSpy();
    componentWithoutConfig.selectState().subscribe(spy);
    componentWithoutConfig.ngOnChanges({ id: new SimpleChange(1, 2, false) });
    componentWithoutConfigFixture.detectChanges();
    expect(spy).toHaveBeenCalledTimes(1);
  });
});
