import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../../../../db/repositories/index.js';
import AppError from '../../../common/AppError.js';
import Responder from '../../../common/responders/Responder.js';
import Result from '../../../common/result/index.js';
import { makeGetSeasonTeamsValidator } from '../../useCase.validators.js';

export interface RequestModel {
  competition: string;
  season: string;
}

export default class GetSeasonTeamsUseCase {
  constructor(
    private responder: Responder,
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository
  ) {}

  static getInstance(
    responder: Responder,
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance()
  ) {
    return new GetSeasonTeamsUseCase(responder, competitionRepo, seasonRepo);
  }

  async execute({ competition, season }: RequestModel): Promise<void> {
    try {
      const validator = makeGetSeasonTeamsValidator(
        this.competitionRepo,
        this.seasonRepo
      );
      await validator.validateCompetition(competition);
      const foundSeason = await validator.validateSeason(competition, season);

      const teams = foundSeason.teams ?? [];
      this.responder.respond(teams);
    } catch (err: any) {
      if (err.isFailure) {
        throw err;
      }

      throw Result.fail(
        AppError.create(
          'request-failed',
          'SeasonTeams could not be fetched',
          err
        ),
        'Internal Server Error'
      );
    }
  }
}
