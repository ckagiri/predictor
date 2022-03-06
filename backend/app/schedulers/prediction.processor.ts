import { Observable, from, of } from 'rxjs';
import { concatMap, map, flatMap, toArray } from 'rxjs/operators';

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

import { Match } from '../../db/models/match.model';
import { Prediction, PredictionStatus } from '../../db/models/prediction.model';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface PredictionProcessor {
  getOrCreatePredictions$(match: Match): Observable<Prediction[]>;
  processPrediction$(
    prediction: Prediction,
    match: Match,
  ): Observable<Prediction>;
}

export class PredictionProcessorImpl implements PredictionProcessor {
  public static getInstance(
    userRepo?: UserRepository,
    matchRepo?: MatchRepository,
    predictionRepo?: PredictionRepository
  ) {
    const userRepoImpl = userRepo ?? UserRepositoryImpl.getInstance();
    const matchRepoImpl = matchRepo ?? MatchRepositoryImpl.getInstance();
    const predictionRepoImpl = predictionRepo ?? PredictionRepositoryImpl.getInstance(matchRepoImpl)

    return new PredictionProcessorImpl(
      userRepoImpl,
      predictionRepoImpl,
      PredictionCalculator.getInstance(),
    );
  }
  constructor(
    private userRepo: UserRepository,
    private predictionRepo: PredictionRepository,
    private predictionCalculator: PredictionCalculator,
  ) { }

  public getOrCreatePredictions$(match: Match) {
    const { gameRound } = match;
    return this.userRepo
      .findAll$()
      .pipe(
        flatMap(users => users),
        flatMap(user => {
          const userId = user.id;
          return this.predictionRepo
            .findOrCreateJoker$(
              userId!,
              gameRound!,
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

          if (jokerPrediction.match.toString() === matchId) {
            return of(jokerPrediction);
          }
          return this.predictionRepo.findOneOrCreate$(userId!, matchId!);
        }),
      )
      .pipe(toArray());
  }

  public processPrediction$(prediction: Prediction, match: Match) {
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
