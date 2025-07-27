import { Response } from 'express';

import HttpRequestModel from '../../common/interfaces/HttpRequestModel.js';
import OkResponder from '../../common/responders/ok.responder.js';
import GetTeamsUseCase from './useCases/getTeams.useCase.js';

class GetTeamsController {
  constructor(private readonly useCase: GetTeamsUseCase) {}

  static getInstance(useCase: GetTeamsUseCase) {
    return new GetTeamsController(useCase);
  }

  async processRequest(_request: HttpRequestModel): Promise<void> {
    await this.useCase.execute();
  }
}

export const makeGetTeamsController = (res: Response) => {
  const okResponder = new OkResponder(res);
  const useCase = GetTeamsUseCase.getInstance(okResponder);
  return GetTeamsController.getInstance(useCase);
};
