import { Observable, of, from, throwError } from 'rxjs';
import { filter, first, flatMap, catchError } from 'rxjs/operators';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

import PredictionModel, {
  Prediction,
  PredictionDocument,
  PredictionStatus,
} from '../models/prediction.model';
import { Match, MatchStatus } from '../models/match.model';
import {
  MatchRepository,
  MatchRepositoryImpl,
} from '../repositories/match.repo';
import { Score } from '../../common/score';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

export interface PredictionRepository extends BaseRepository<Prediction> {
  findOrCreateJoker$(
    userId: string,
    roundId: string,
    autoPicked: true,
    roundMatches: Match[]
  ): Observable<Prediction>;
  findOneOrCreate$({
    userId,
    matchId,
  }: {
    userId: string;
    matchId: string;
  }): Observable<Prediction>;
}

export class PredictionRepositoryImpl
  extends BaseRepositoryImpl<Prediction, PredictionDocument>
  implements PredictionRepository {
  public static getInstance() {
    return new PredictionRepositoryImpl(
      MatchRepositoryImpl.getInstance(ApiProvider.LIGI),
    );
  }

  private matchRepo: MatchRepository;

  constructor(matchRepo: MatchRepository) {
    super(PredictionModel);
    this.matchRepo = matchRepo;
  }
  findOrCreateJoker$(
    userId: string, roundId: string, autoPicked: boolean = true, roundMatches: Match[] = []
  ): Observable<Prediction> {
    return (roundMatches.length ? of(roundMatches) : this.matchRepo.findAll$({ gameRound: roundId }))
      .pipe(
        flatMap(matches => {
          const matchIds = matches.map(m => m.id?.toString())
          const query = {
            user: userId,
            match: { $in: matchIds },
            hasJoker: true
          }
          // todo: handle no matches
          return this.findAll$(query)
            .pipe(
              flatMap(predictions => {
                const jokers = [];
                if (predictions.length === 0) {
                  const jokerMatchId = matchIds[Math.floor(Math.random() * matchIds.length)]!;
                  const { slug: jokerMatchSlug } = matches.find(m => m.id?.toString() === jokerMatchId) as Match
                  const randomMatchScore = this.getRandomMatchScore();

                  const joker: Prediction = {
                    user: userId,
                    match: jokerMatchId,
                    matchSlug: jokerMatchSlug,
                    hasJoker: true,
                    jokerAutoPicked: autoPicked,
                    choice: randomMatchScore,
                  };
                  jokers.push(joker);
                } else if (predictions.length === 1) {
                  return of(predictions);
                } else {
                  // todo: use recent joker
                  const [joker, ...otherJokers] = predictions.reverse();
                  jokers.push(joker)
                  otherJokers.forEach(j => {
                    j.hasJoker = false;
                    jokers.push(j);
                  });
                }
                return this.saveMany$(jokers);
              })
            )
            .pipe(
              catchError((error: any) => {
                return throwError(error);
              }),
            )
            .pipe(
              flatMap(predictions => {
                return from(predictions);
              }),
            )
            .pipe(
              filter(prediction => {
                return !!prediction.hasJoker;
              }),
            )
            .pipe(first());
        })
      )
  }

  public findOne$(query?: any) {
    const { userId, matchId } = query;
    // prediction model doesnt have Id suffix for the reference models;
    // here I am expecting the Id suffix and not quite sure why
    // todo: clean up
    if (userId !== undefined && matchId !== undefined) {
      query.user = userId;
      query.match = matchId;
      delete query.userId;
      delete query.matchId;
    }
    return super.findOne$(query);
  }

  public findOneOrCreate$({
    userId,
    matchId,
  }: {
    userId: string;
    matchId: string;
  }) {
    const query = { user: userId, match: matchId };
    return this.findOne$(query).pipe(
      flatMap(prediction => {
        if (prediction) {
          return of(prediction);
        }
        return this.matchRepo.findById$(matchId).pipe(
          flatMap(match => {
            const {
              slug: matchSlug,
              season,
            } = match as Required<Match>;
            const pred: Prediction = {
              user: userId,
              match: matchId,
              matchSlug,
              choice: {} as any,
            };
            const randomMatchScore = this.getRandomMatchScore();
            pred.choice = randomMatchScore;
            return this.save$(pred);
          }),
        );
      }),
    );
  }

  private getRandomMatchScore() {
    const scoreList = [
      '0-0',
      '1-1',
      '1-1',
      '2-2',
      '1-0',
      '1-0',
      '2-0',
      '2-0',
      '2-0',
      '2-1',
      '2-1',
      '2-1',
      '3-0',
      '3-1',
      '3-2',
      '0-1',
      '0-1',
      '0-1',
      '0-1',
      '0-2',
      '1-2',
      '1-2',
      '0-3',
      '1-3',
      '2-3',
    ];
    const score = scoreList[Math.floor(Math.random() * scoreList.length)].split(
      '-',
    );
    const goalsHomeTeam = Number(score[0]);
    const goalsAwayTeam = Number(score[1]);
    return {
      goalsHomeTeam,
      goalsAwayTeam,
      isComputerGenerated: true,
    };
  }
}
