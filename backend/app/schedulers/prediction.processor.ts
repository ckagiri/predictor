import { MatchStatus } from '../../db/models/match.model';
import { count, from, last, lastValueFrom, map, mergeMap, of } from 'rxjs';
import { Match } from '../../db/models';
import { MatchRepository, MatchRepositoryImpl } from '../../db/repositories/match.repo';
import { PredictionRepository, PredictionRepositoryImpl } from '../../db/repositories/prediction.repo';
import PredictionCalculator from './prediction.calculator';
import { uniq } from 'lodash';

export interface PredictionProcessor {
  calculatePredictionPoints(seasonId: string, matches: Match[]): Promise<number>;
}

export class PredictionProcessorImpl implements PredictionProcessor {
  public static getInstance(
    matchRepo?: MatchRepository,
    predictionRepo?: PredictionRepository,
    predictionCalculator?: PredictionCalculator,
  ) {
    const matchRepoImpl = matchRepo ?? MatchRepositoryImpl.getInstance();
    const predictionRepoImpl = predictionRepo ?? PredictionRepositoryImpl.getInstance(matchRepoImpl);
    const predictionCalc = predictionCalculator ?? PredictionCalculator.getInstance();
    return new PredictionProcessorImpl(
      matchRepoImpl, predictionRepoImpl, predictionCalc,
    );
  }

  constructor(
    private matchRepo: MatchRepository,
    private predictionRepo: PredictionRepository,
    private predictionCalculator: PredictionCalculator,
  ) { }

  public calculatePredictionPoints(seasonId: string, matchesArray: Match[]): Promise<number> {
    const matches = matchesArray.filter(
      m => m.status === MatchStatus.FINISHED && m.season.toString() === seasonId);
    const gameRoundIds = uniq(matches.map(m => m.gameRound.toString()));

    return lastValueFrom(
      this.predictionRepo.distinct$('user', { season: seasonId })
        .pipe(
          mergeMap(userIds => from(matches)
            .pipe(
              map(match => ({ match, userIds }))
            )
          ),
          mergeMap(({ match, userIds }) => from(gameRoundIds)
            .pipe(
              map(gameRoundId => ({
                match, gameRoundId, userIds
              }))
            )
          ),
          mergeMap(({ match, gameRoundId, userIds }) => from(userIds)
            .pipe(
              map(userId => ({
                match, gameRoundId, userId
              })
              )
            )
          ),
          mergeMap(({ match, gameRoundId, userId }) => {
            const matchId = match.id!.toString();
            return this.predictionRepo.findOrCreateJoker$(userId, gameRoundId)
              .pipe(
                mergeMap(jokerPrediction => {
                  if (jokerPrediction.match.toString() === matchId) {
                    return of(jokerPrediction)
                  }
                  return this.predictionRepo.findOneOrCreate$(userId, matchId)
                }),
                map(prediction => ({ match, prediction }))
              )
          }),
          mergeMap(({ match, prediction }) => {
            const { result } = match;
            const { choice } = prediction;

            const scorePoints = this.predictionCalculator.calculateScore(result!, choice);
            return this.predictionRepo.findByIdAndUpdate$(prediction.id!, { scorePoints })
          }),
          count(),
          mergeMap(predsUpdated => {
            return from(matches)
              .pipe(
                mergeMap(match => {
                  return this.matchRepo.findByIdAndUpdate$(match.id!, { allPredictionPointsCalculated: true })
                }),
                last(),
                map(() => predsUpdated)
              )
          })
        )
    )
  }
}
