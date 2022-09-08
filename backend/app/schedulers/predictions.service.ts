import { lastValueFrom } from 'rxjs';
import { compact, isEmpty } from 'lodash';

import { CompetitionRepository, CompetitionRepositoryImpl } from '../../db/repositories/competition.repo';
import { MatchRepository, MatchRepositoryImpl } from '../../db/repositories/match.repo';
import { SeasonRepository, SeasonRepositoryImpl } from '../../db/repositories/season.repo';
import { PredictionRepository, PredictionRepositoryImpl } from '../../db/repositories/prediction.repo';
import { PredictionProcessor, PredictionProcessorImpl } from './prediction.processor';

export interface PredictionsService {
  calculatePredictionPoints(): Promise<number>;
  createIfNotExistsCurrentRoundPredictions(): Promise<void>;
}

export class PredictionsServiceImpl {
  public static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    seasonRepo = SeasonRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    predictionRepo = PredictionRepositoryImpl.getInstance(),
    predictionProcessor = PredictionProcessorImpl.getInstance(predictionRepo)) {
    return new PredictionsServiceImpl(
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
    const competitions = await lastValueFrom(this.competitionRepo.findAll$());
    const currentSeasonIds = compact(competitions.map(c => c.currentSeason?.toString()));
    const currentSeasons = await lastValueFrom(this.seasonRepo.findAllByIds$(currentSeasonIds));
    const result = await lastValueFrom(this.matchRepo.findAllForCurrentGameRounds$(currentSeasons));

    for await (const [seasonId, currentRoundMatches] of result) {
      let users: string[] = [];
      users = await lastValueFrom(this.predictionRepo.distinct$('user', { season: seasonId }));
      if (isEmpty(users)) {
        users = ['62f2c38bc485ceeaac9e2bbf', '62f2c564c485ceeaac9e2bc3'];
      }
      for await (const userId of users) {
        await lastValueFrom(this.predictionRepo.findOrCreatePredictions$(userId, currentRoundMatches))
      }
    }
  }

  async calculatePredictionPoints() {
    const competitions = await lastValueFrom(this.competitionRepo.findAll$());
    const currentSeasonIds = competitions.map(c => c.currentSeason?.toString() || '');
    const result = await lastValueFrom(
      this.matchRepo.findAllFinishedForCurrentSeasons$(currentSeasonIds, { allPredictionPointsCalculated: false })
    );
    let predictionsUpdated = 0;
    for await (const [seasonId, matches] of result) {
      if (isEmpty(matches)) continue;
      const updates = await this.predictionProcessor.calculateAndUpdatePredictionPoints(seasonId, matches)
      predictionsUpdated += updates;
      matches.forEach(match => {
        match.allPredictionPointsCalculated = true;
      });
      await lastValueFrom(this.matchRepo.updateMany$(matches));
    }
    return predictionsUpdated;
  }
}
