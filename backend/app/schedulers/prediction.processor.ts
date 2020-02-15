import { Observable, from, of } from 'rxjs';
import { map, flatMap, toArray } from 'rxjs/operators';

import {
  IFixtureRepository,
  FixtureRepository,
} from '../../db/repositories/fixture.repo';
import {
  IUserRepository,
  UserRepository,
} from '../../db/repositories/user.repo';
import {
  IPredictionRepository,
  PredictionRepository,
} from '../../db/repositories/prediction.repo';
import { PredictionCalculator } from './prediction.calculator';

import { IFixture } from '../../db/models/fixture.model';
import {
  IPrediction,
  PredictionStatus,
} from '../../db/models/prediction.model';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

export interface IPredictionProcessor {
  getPredictions$(fixture: IFixture): Observable<IPrediction[]>;
  processPrediction$(
    prediction: IPrediction,
    fixture: IFixture,
  ): Observable<IPrediction>;
}

export class PredictionProcessor implements IPredictionProcessor {
  public static getInstance() {
    return new PredictionProcessor(
      FixtureRepository.getInstance(ApiProvider.LIGI),
      UserRepository.getInstance(),
      PredictionRepository.getInstance(),
      PredictionCalculator.getInstance(),
    );
  }
  constructor(
    private fixtureRepo: IFixtureRepository,
    private userRepo: IUserRepository,
    private predictionRepo: IPredictionRepository,
    private predictionCalculator: PredictionCalculator,
  ) {}

  public getPredictions$(fixture: IFixture) {
    const { season: seasonId, gameRound } = fixture;
    return this.fixtureRepo
      .findSelectableFixtures$(seasonId!, gameRound!)
      .pipe(
        map(selectableFixtures => {
          return [...selectableFixtures, fixture].map(n => n.id!);
        }),
      )
      .pipe(
        flatMap(fixtureIds => {
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
                  selectableFixtureIds: fixtureIds,
                  user,
                };
              }),
            );
        }),
      )
      .pipe(
        flatMap(data => {
          const selectableFixtureIds = data.selectableFixtureIds;
          const userId = data.user.id;
          return this.predictionRepo
            .findOrCreateJoker$(
              userId!,
              seasonId!,
              gameRound!,
              selectableFixtureIds,
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
          const fixtureId = fixture.id;
          const { userId, jokerPrediction } = data;

          if (jokerPrediction.fixture === fixtureId) {
            return of(jokerPrediction);
          }
          return this.predictionRepo.findOneOrCreate$({
            userId: userId!,
            fixtureId: fixtureId!,
          });
        }),
      )
      .pipe(toArray());
  }

  public processPrediction$(prediction: IPrediction, fixture: IFixture) {
    const { choice } = prediction;
    const { result } = fixture;
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
