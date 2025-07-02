import * as constants from './constants.js';

export interface ValidationMessage {
  field?: string;
  msg: string;
  param?: string;
}

class AppError extends Error {
  code?: string;
  validationErrors?: ValidationMessage[];

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
    validationErrors?: ValidationMessage[];
  }) {
    super(message, { cause });
    this.name = name;
    this.code = code;
    this.validationErrors = validationErrors;
  }

  static create(name: string, message?: string, cause?: Error) {
    return new AppError({ cause, message, name });
  }

  static resourceNotFound(message: string) {
    return new AppError({
      code: constants.ERR_VALUE_NOT_FOUND,
      message,
      name: 'resource-not-found',
    });
  }

  static unauthorized() {
    return new AppError({
      code: constants.ERR_UNAUTHORIZED,
      message: 'valid authentication credentials were not provided',
      name: 'unauthorized',
    });
  }

  static validationFailed(
    message: string | ValidationMessage[],
    validationErrors?: ValidationMessage[]
  ) {
    return new AppError({
      code: constants.ERR_VALIDATION,
      message: typeof message === 'string' ? message : 'Validation failed',
      name: 'bad-request',
      validationErrors: Array.isArray(message) ? message : validationErrors,
    });
  }
}

export default AppError;
