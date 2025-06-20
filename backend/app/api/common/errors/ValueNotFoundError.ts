import * as constants from '../constants.js';

export class ValueNotFoundError extends Error {
  code: string;

  constructor(message = 'Value not found') {
    super(message);
    this.name = this.constructor.name;
    this.code = constants.ERR_VALUE_NOT_FOUND;
  }
}
