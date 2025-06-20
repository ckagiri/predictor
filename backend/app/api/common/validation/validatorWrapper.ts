import { ValidationError as joiError, ObjectSchema } from 'joi';

import { ValidationError } from '../errors/ValidationError.js';
import Result from '../result/index.js';
import Validator from './validator.js';

export class JoiValidator implements Validator {
  private schema: ObjectSchema;

  public constructor(schema: ObjectSchema) {
    this.schema = schema;
  }

  public async validate<T>(
    payload: Record<string, any>
  ): Promise<Result.ResultType<T | undefined, ValidationError | undefined>> {
    try {
      const value: T = await this.schema.validateAsync(payload, {
        abortEarly: true,
      });

      return Result.ok<T>(value);
    } catch (err: any) {
      const error: joiError = err;

      const FIRST_ERROR = 0;
      const errorMessage = error.details[FIRST_ERROR].message;
      return Result.fail(new ValidationError(errorMessage.replace(/"/g, "'")));
    }
  }
}
