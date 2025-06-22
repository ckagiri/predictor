import * as constants from './constants.js';

export class AppError extends Error {
  code?: string;
  validationErrors?: any;

  constructor({
    cause,
    code,
    message,
    name,
    validationErrors,
  }: {
    cause?: Error;
    code?: string;
    message?: string;
    name: string;
    validationErrors?: string;
  }) {
    super(message, { cause });
    this.name = name;
    this.code = code;
    this.validationErrors = validationErrors;
  }

  static createError(name: string, message?: string, cause?: Error) {
    return new AppError({ cause, message, name });
  }

  static createNotFoundError(message: string) {
    return new AppError({
      code: constants.ERR_VALUE_NOT_FOUND,
      message,
      name: 'resource-not-found',
    });
  }

  static createValidationError(message: string, validationErrors?: any) {
    return new AppError({
      code: constants.ERR_VALIDATION,
      message,
      name: 'validation-errors',
      validationErrors,
    });
  }
}
