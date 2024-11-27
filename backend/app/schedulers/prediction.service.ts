import { lastValueFrom } from 'rxjs';
import { compact, isEmpty } from 'lodash';

import { CompetitionRepository, CompetitionRepositoryImpl } from '../../db/repositories/competition.repo';
import { MatchRepository, MatchRepositoryImpl } from '../../db/repositories/match.repo';
import { SeasonRepository, SeasonRepositoryImpl } from '../../db/repositories/season.repo';
import { PredictionRepository, PredictionRepositoryImpl } from '../../db/repositories/prediction.repo';
import { PredictionProcessor, PredictionProcessorImpl } from './prediction.processor';

export interface PredictionService {
  calculatePredictionPoints(): Promise<void>;
  createIfNotExistsCurrentRoundPredictions(): Promise<void>;
}

export class PredictionServiceImpl {
  public static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    predictionRepo = PredictionRepositoryImpl.getInstance(),
    predictionProcessor = PredictionProcessorImpl.getInstance(predictionRepo)) {
    return new PredictionServiceImpl(
      competitionRepo, seasonRepo, matchRepo, predictionRepo, predictionProcessor
    );
  }

  constructor(
    private competitionRepo: CompetitionRepository,
    private seasonRepo: SeasonRepository,
    private matchRepo: MatchRepository,
    private predictionRepo: PredictionRepository,
    private predictionProcessor: PredictionProcessor) {
  }

  async createIfNotExistsCurrentRoundPredictions() {
    try {
      const competitions = await lastValueFrom(this.competitionRepo.findAll$());
      const currentSeasonIds = compact(competitions.map(c => c.currentSeason?.toString()));
      // Todo: filter season-end not in the past
      const currentSeasons = await lastValueFrom(this.seasonRepo.findAllByIds$(currentSeasonIds));
      const result = await lastValueFrom(this.matchRepo.findAllFinishedByCurrentRound$(currentSeasons));

      for await (const [seasonId, currentRoundMatches] of result) {
        let users: string[] = [];
        users = await lastValueFrom(this.predictionRepo.distinct$('user', { season: seasonId }));
        for await (const userId of users) {
          await lastValueFrom(this.predictionRepo.findOrCreatePredictions$(userId, currentRoundMatches))
        }
      }
    } catch (err: any) {
      console.log(err.message);
    }
  }

  async calculatePredictionPoints() {
    try {
      const competitions = await lastValueFrom(this.competitionRepo.findAll$());
      const currentSeasonIds = competitions.map(c => c.currentSeason?.toString() || '');
      const result = await lastValueFrom(
        this.matchRepo.findAllFinishedBySeason$(currentSeasonIds, { allPredictionPointsCalculated: false })
      );
      for await (const [seasonId, matches] of result) {
        if (isEmpty(matches)) continue;
        await this.predictionProcessor.calculateAndUpdatePredictionPoints(seasonId, matches)
        matches.forEach(match => {
          match.allPredictionPointsCalculated = true;
        });
        await lastValueFrom(this.matchRepo.updateMany$(matches));
      }
    } catch (err: any) {
      console.log(err.message);
    }
  }
}
