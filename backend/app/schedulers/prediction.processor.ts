import { Observable, from, of } from 'rxjs';
import { map, flatMap, toArray } from 'rxjs/operators';

import {
  MatchRepository,
  MatchRepositoryImpl,
} from '../../db/repositories/match.repo';
import {
  UserRepository,
  UserRepositoryImpl,
} from '../../db/repositories/user.repo';
import {
  PredictionRepository,
  PredictionRepositoryImpl,
} from '../../db/repositories/prediction.repo';
import { PredictionCalculator } from './prediction.calculator';

import { MatchEntity } from '../../db/models/match.model';
import {
  PredictionEntity,
  PredictionStatus,
} from '../../db/models/prediction.model';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface IPredictionProcessor {
  getPredictions$(match: MatchEntity): Observable<PredictionEntity[]>;
  processPrediction$(
    prediction: PredictionEntity,
    match: MatchEntity,
  ): Observable<PredictionEntity>;
}

export class PredictionProcessor implements IPredictionProcessor {
  public static getInstance() {
    return new PredictionProcessor(
      MatchRepositoryImpl.getInstance(ApiProvider.LIGI),
      UserRepositoryImpl.getInstance(),
      PredictionRepositoryImpl.getInstance(),
      PredictionCalculator.getInstance(),
    );
  }
  constructor(
    private matchRepo: MatchRepository,
    private userRepo: UserRepository,
    private predictionRepo: PredictionRepository,
    private predictionCalculator: PredictionCalculator,
  ) {}

  public getPredictions$(match: MatchEntity) {
    const { season: seasonId, gameRound } = match;
    return this.matchRepo
      .findSelectableMatches$(seasonId!, gameRound!)
      .pipe(
        map(selectableMatches => {
          return [...selectableMatches, match].map(n => n.id!);
        }),
      )
      .pipe(
        flatMap(matchIds => {
          return this.userRepo
            .findAll$()
            .pipe(
              flatMap(users => {
                return from(users);
              }),
            )
            .pipe(
              map(user => {
                return {
                  selectableMatchIds: matchIds,
                  user,
                };
              }),
            );
        }),
      )
      .pipe(
        flatMap(data => {
          const selectableMatchIds = data.selectableMatchIds;
          const userId = data.user.id;
          return this.predictionRepo
            .findOrCreateJoker$(
              userId!,
              seasonId!,
              gameRound!,
              selectableMatchIds,
            )
            .pipe(
              map(jokerPrediction => {
                return {
                  userId,
                  jokerPrediction,
                };
              }),
            );
        }),
      )
      .pipe(
        flatMap(data => {
          const matchId = match.id;
          const { userId, jokerPrediction } = data;

          if (jokerPrediction.match === matchId) {
            return of(jokerPrediction);
          }
          return this.predictionRepo.findOneOrCreate$({
            userId: userId!,
            matchId: matchId!,
          });
        }),
      )
      .pipe(toArray());
  }

  public processPrediction$(prediction: PredictionEntity, match: MatchEntity) {
    const { choice } = prediction;
    const { result } = match;
    const scorePoints = this.predictionCalculator.calculateScore(
      choice,
      result!,
    );
    const status = PredictionStatus.PROCESSED;
    return this.predictionRepo.findByIdAndUpdate$(prediction.id!, {
      scorePoints,
      status,
    });
  }
}
