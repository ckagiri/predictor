import { ValidationError as joiError, ObjectSchema } from 'joi';

import { AppError } from '../AppError.js';
import Result from '../result/index.js';
import Validator from './validator.js';

export class JoiValidator implements Validator {
  private schema: ObjectSchema;

  constructor(schema: ObjectSchema) {
    this.schema = schema;
  }

  async validate<T>(
    payload: Record<string, unknown>
  ): Promise<Result.ResultType<T, AppError>> {
    try {
      const value: T = await this.schema.validateAsync(payload, {
        abortEarly: true,
      });

      return Result.ok<T>(value);
    } catch (err: any) {
      const error: joiError = err;

      const FIRST_ERROR = 0;
      const errorMessage = error.details[FIRST_ERROR].message;
      return Result.fail(
        AppError.validationFailed(errorMessage.replace(/"/g, "'"))
      );
    }
  }
}
