import { lastValueFrom } from 'rxjs';

import {
  TeamRepository,
  TeamRepositoryImpl,
} from '../../../../../db/repositories/team.repo.js';
import { ValueNotFoundError } from '../../../common/errors/index.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';

export default class GetTeamsUseCase {
  constructor(
    private responder: Responder,
    private teamRepo: TeamRepository
  ) {}

  public static getInstance(
    responder: Responder,
    teamRepo = TeamRepositoryImpl.getInstance()
  ) {
    return new GetTeamsUseCase(responder, teamRepo);
  }

  async execute(): Promise<void> {
    try {
      const foundTeams = await lastValueFrom(this.teamRepo.findAll$());

      this.responder.respond(foundTeams);
    } catch (err: any) {
      if (err.isFailure) {
        throw err.unwrap();
      }

      throw Result.fail(err);
    }
  }
}
