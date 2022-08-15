import { lastValueFrom } from 'rxjs';

import { CompetitionRepository, CompetitionRepositoryImpl } from '../../db/repositories/competition.repo';
import { MatchRepository, MatchRepositoryImpl } from '../../db/repositories/match.repo';
import { PredictionProcessor, PredictionProcessorImpl } from './prediction.processor';
import { isEmpty } from 'lodash';

export interface CalculatePredictionsService {
  updatePredictionPoints(): Promise<void>;
}

export class CalculatePredictionsServiceImpl {
  public static getInstance(
    competitionRepo = CompetitionRepositoryImpl.getInstance(),
    matchRepo = MatchRepositoryImpl.getInstance(),
    predictionProcessor = PredictionProcessorImpl.getInstance()) {
    return new CalculatePredictionsServiceImpl(competitionRepo, matchRepo, predictionProcessor);
  }

  constructor(
    private competitionRepo: CompetitionRepository,
    private matchRepo: MatchRepository,
    private predictionProcessor: PredictionProcessor) {
  }

  async updatePredictionPoints() {
    const competitions = await lastValueFrom(this.competitionRepo.findAll$());
    const currentSeasonIds = competitions.map(c => c.currentSeason?.toString() || '');
    const result = await lastValueFrom(
      this.matchRepo.findAllFinishedForCurrentSeasons$(currentSeasonIds, { allPredictionPointsCalculated: false })
    );
    for await (const [seasonId, matches] of result) {
      if (isEmpty(matches)) continue;
      await this.predictionProcessor.calculateAndUpdatePredictionPoints(seasonId, matches)
      matches.forEach(match => {
        match.allPredictionPointsCalculated = true;
      });
      await lastValueFrom(this.matchRepo.updateMany$(matches));
    }
  }
}

