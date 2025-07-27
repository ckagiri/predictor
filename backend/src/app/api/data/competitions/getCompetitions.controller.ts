import { Response } from 'express';

import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import GetCompetitionsUseCase from './useCases/getCompetitions.useCase.js';

class GetCompetitionsController {
  constructor(private readonly useCase: GetCompetitionsUseCase) {}

  static getInstance(useCase: GetCompetitionsUseCase) {
    return new GetCompetitionsController(useCase);
  }

  async processRequest(_request: HttpRequestModel): Promise<void> {
    await this.useCase.execute();
  }
}

export const makeGetCompetitionsController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const useCase = GetCompetitionsUseCase.getInstance(okResponder);
  return GetCompetitionsController.getInstance(useCase);
};
