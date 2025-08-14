import { Response } from 'express';

import AppError from '../../common/AppError';
import HttpRequestModel from '../../common/interfaces/HttpRequestModel';
import CreatedResponder from '../../common/responders/created.responder';
import { FailureResult } from '../../common/result';
import Validator from '../../common/validation/validator';
import { updateMatchValidator } from './matches.validator';
import UpdateMatchUseCase, {
  RequestModel,
} from './useCases/updateMatch.useCase';

export default class UpdateMatchController {
  constructor(
    private readonly useCase: UpdateMatchUseCase,
    private readonly validation: Validator
  ) {}

  static getInstance(
    useCase: UpdateMatchUseCase,
    validation = updateMatchValidator
  ) {
    return new UpdateMatchController(useCase, validation);
  }

  async processRequest(request: HttpRequestModel): Promise<void> {
    const { competition, season, slug } = request.params;
    const requestValidated = await this.validation.validate<RequestModel>({
      competition,
      matchDetails: request.body,
      season,
      slug,
    });

    if (requestValidated.isFailure) {
      throw requestValidated as FailureResult<AppError>;
    }

    const requestModel = requestValidated.value!;
    if (request.node2) {
      this.useCase.setBackgroundWorker(request.node2);
    }
    await this.useCase.execute(requestModel);
  }

  makeUpdateMatchController = (res: Response, req: Request) => {
    const createdResponder = new CreatedResponder(res);
    const useCase = UpdateMatchUseCase.getInstance(createdResponder);
    return UpdateMatchController.getInstance(useCase);
  };
}
