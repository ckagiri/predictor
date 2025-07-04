import { startCase } from 'lodash';

export type Result<T = unknown, E extends Error = Error> =
  | SuccessResult<T>
  | FailureResult<E>;

export interface ResultType<T, E> {
  readonly error?: E;
  /** Returns `true` if an error result, `false` otherwise */
  isFailure: boolean;

  /** Returns `true` if a success result, `false` otherwise` */
  isSuccess: boolean;

  unwrap(): T | E;

  readonly value?: T;
}

export class FailureResult<E extends Error>
  extends Error
  implements ResultType<undefined, E>
{
  constructor(cause: E, message?: string) {
    super(message ?? cause.message, { cause });
    this.name = 'FailureResult';
  }
  unwrap(): E {
    return this.cause as E;
  }

  get error(): E {
    return this.cause as E;
  }

  get value() {
    return undefined;
  }

  get reason() {
    const cause = this.cause;
    return typeof this.message === 'string' && this.message.length > 0
      ? this.message
      : cause && cause instanceof Error && cause.name
        ? startCase(cause.name)
        : 'Something went wrong';
  }

  readonly isSuccess = false;
  readonly isFailure = true;
}

export class SuccessResult<T = unknown> implements ResultType<T, undefined> {
  private _value: T;

  constructor(value: T) {
    this._value = value;
  }
  unwrap(): T {
    return this._value;
  }

  get error() {
    return undefined;
  }

  get value() {
    return this._value;
  }

  readonly isSuccess = true;
  readonly isFailure = false;
}

export function fail<E extends Error>(
  cause: E,
  reason?: string
): FailureResult<E> {
  return new FailureResult<E>(cause, reason);
}

export function ok<T>(value: T): SuccessResult<T> {
  return new SuccessResult<T>(value);
}
