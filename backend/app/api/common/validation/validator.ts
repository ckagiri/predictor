import { ValidationError } from '../errors/ValidationError.js';
import Result from '../result/index.js';

export default interface Validator {
  validate<T>(
    payload: Record<string, unknown>
  ): Promise<Result.ResultType<T, ValidationError>>;
}
