export class FailResponse {
  public content: null;
  public error: any;

  public constructor(errorProps: any = {}) {
    const error = {
      msg: errorProps.msg,
      reason: errorProps.reason,
      validationErrors: errorProps.validationErrors ?? [],
    };
    this.error = error;
    this.content = null;
  }

  public static create(errorProps: any): FailResponse {
    const { msg, reason, validationErrors } = errorProps;
    return new FailResponse({ msg, reason, validationErrors });
  }
}

export class SuccessResponse {
  public error: null;
  public content: any;

  public constructor(content: any) {
    this.content = content;
    this.error = null;
  }

  public static create(content: any): SuccessResponse {
    return new SuccessResponse(content);
  }
}
