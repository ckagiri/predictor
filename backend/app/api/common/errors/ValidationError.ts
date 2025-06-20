import * as constants from '../constants.js';

export class ValidationError extends Error {
  public readonly code: string;
  public reason?: string;
  public validationErrors?: any;

  constructor(message: string, reason?: string) {
    super(message);
    this.name = this.constructor.name;
    this.code = constants.ERR_VALIDATION;
    this.reason = reason;
  }
}
