import { lastValueFrom } from 'rxjs';

import {
  TeamRepository,
  TeamRepositoryImpl,
} from '../../../../../db/repositories/team.repo.js';
import AppError from '../../../common/AppError.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';

export default class GetTeamUseCase {
  constructor(
    private responder: Responder,
    private teamRepo: TeamRepository
  ) {}

  static getInstance(
    responder: Responder,
    teamRepo = TeamRepositoryImpl.getInstance()
  ) {
    return new GetTeamUseCase(responder, teamRepo);
  }

  async execute(slug: string): Promise<void> {
    try {
      const foundTeam = await lastValueFrom(this.teamRepo.findOne$({ slug }));

      if (!foundTeam) {
        throw Result.fail(
          AppError.resourceNotFound(`Could not find team with slug ${slug}`)
        );
      }
      this.responder.respond(foundTeam);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }
      throw Result.fail(
        AppError.create('fetch-failed', 'Team could not be fetched', err),
        'Internal Server Error'
      );
    }
  }
}
