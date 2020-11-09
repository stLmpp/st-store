export class ControlValueNotFound extends Error {
  constructor() {
    super(`ControlValue not found`);
  }
}

export class ControlParentNotFound extends Error {
  constructor(directiveName: string, name: string | number) {
    super(
      `"${directiveName}" with name "${name}" is missing a parent directive ([controlGroup], [controlGroupName], [controlArrayName])`
    );
    this.name = 'ControlParentNotFound';
  }
}

export class ControlNameNotFound extends Error {
  constructor(directiveName: string, name: string | number) {
    super(`${directiveName} with name ${name} doesn't exists in parent`);
    this.name = 'ControlNameNotFound';
  }
}

export class ControlNameDoesNotMatch extends Error {
  constructor(directiveName: string, name: string | number) {
    super(`${directiveName} with name ${name} exists, but is not the same type as the directive`);
    this.name = 'ControlNameDoesNotMatch';
  }
}
