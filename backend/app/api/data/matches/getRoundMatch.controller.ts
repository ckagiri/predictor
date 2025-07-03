import { Response } from 'express';

import AppError from '../../common/AppError.js';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import Result from '../../common/result/index.js';
import Validator from '../../common/validation/validator.js';
import { getRoundMatchValidator as getMatchValidator } from './matches.validator.js';
import GetRoundMatchUseCase, {
  RequestModel,
} from './useCases/getRoundMatch.useCase.js';

class GetRoundMatchController {
  constructor(
    private readonly getMatchUseCase: GetRoundMatchUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    getMatchUseCase: GetRoundMatchUseCase,
    validation = getMatchValidator
  ) {
    return new GetRoundMatchController(getMatchUseCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const { competition, round, season, slug } = request.params;
    const requestValidated = await this.validation.validate<RequestModel>({
      competition,
      round,
      season,
      slug,
    });

    if (requestValidated.isFailure) {
      throw Result.fail(requestValidated.unwrap() as AppError, 'Bad Request');
    }

    const requestModel = requestValidated.value!;
    await this.getMatchUseCase.execute(requestModel);
  }
}

export const makeGetRoundMatchController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const getMatchUseCase = GetRoundMatchUseCase.getInstance(okResponder);
  return GetRoundMatchController.getInstance(getMatchUseCase);
};
