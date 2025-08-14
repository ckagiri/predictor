import { compact, isEmpty } from 'lodash';
import { lastValueFrom } from 'rxjs';

import {
  CompetitionRepository,
  CompetitionRepositoryImpl,
} from '../../db/repositories/competition.repo.js';
import {
  MatchRepository,
  MatchRepositoryImpl,
} from '../../db/repositories/match.repo.js';
import {
  PredictionRepository,
  PredictionRepositoryImpl,
} from '../../db/repositories/prediction.repo.js';
import {
  SeasonRepository,
  SeasonRepositoryImpl,
} from '../../db/repositories/season.repo.js';
import {
  PredictionProcessor,
  PredictionProcessorImpl,
} from './prediction.processor.js';

export interface PredictionService {
  calculatePredictionPoints(): Promise<void>;
  createIfNotExistsCurrentRoundPredictions(): Promise<void>;
  repickJokerIfMatch(matchId: string, roundId: string): Promise<void>;
}

export class PredictionServiceImpl implements PredictionService {
  constructor(
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository,
    private matchRepo: MatchRepository,
    private predictionRepo: PredictionRepository,
    private predictionProcessor: PredictionProcessor
  ) {}

  public static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    predictionRepo = PredictionRepositoryImpl.getInstance(),
    predictionProcessor = PredictionProcessorImpl.getInstance(predictionRepo)
  ) {
    return new PredictionServiceImpl(
      competitionRepo,
      seasonRepo,
      matchRepo,
      predictionRepo,
      predictionProcessor
    );
  }

  async calculatePredictionPoints() {
    try {
      const competitions = await lastValueFrom(this.competitionRepo.findAll$());
      const currentSeasonIds = competitions.map(
        c => c.currentSeason?.toString() ?? ''
      );
      const result = await lastValueFrom(
        this.matchRepo.findAllFinishedBySeason$(currentSeasonIds, {
          allPredictionPointsCalculated: false,
        })
      );
      for (const [seasonId, matches] of result) {
        if (isEmpty(matches)) continue;
        await this.predictionProcessor.calculateAndUpdatePredictionPoints(
          seasonId,
          matches
        );
        matches.forEach(match => {
          match.allPredictionPointsCalculated = true;
        });
        await lastValueFrom(this.matchRepo.updateMany$(matches));
      }
    } catch (err: any) {
      console.log(err.message);
    }
  }

  async createIfNotExistsCurrentRoundPredictions() {
    try {
      const competitions = await lastValueFrom(this.competitionRepo.findAll$());
      const currentSeasonIds = compact(
        competitions.map(c => c.currentSeason?.toString())
      );
      // Todo: filter season-end not in the past
      const currentSeasons = await lastValueFrom(
        this.seasonRepo.findAllByIds$(currentSeasonIds)
      );
      const result = await lastValueFrom(
        this.matchRepo.findAllByCurrentRound$(currentSeasons)
      );

      for (const [seasonId, currentRoundMatches] of result) {
        let users: string[] = [];
        users = await lastValueFrom(
          this.predictionRepo.distinct$('user', { season: seasonId })
        );
        for (const userId of users) {
          await lastValueFrom(
            this.predictionRepo.findOrCreatePredictions$(
              userId,
              currentRoundMatches
            )
          );
        }
      }
    } catch (err: any) {
      console.log(err.message);
    }
  }

  async repickJokerIfMatch(matchId: string, roundId: string): Promise<void> {
    try {
      const roundMatches = await lastValueFrom(
        this.matchRepo.findAll$({ gameRound: roundId })
      );
      const predsNb = await lastValueFrom(
        this.predictionRepo.repickJokerIfMatch(matchId, roundMatches)
      );
      console.log(
        `repickJokerIfMatch: ${String(predsNb)} predictions updated.`
      );
    } catch (err: any) {
      console.log(err.message);
    }
  }
}
