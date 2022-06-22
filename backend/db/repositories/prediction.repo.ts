import { Observable, of, from, throwError, iif } from 'rxjs';
import { filter, mergeMap, map, catchError, toArray } from 'rxjs/operators';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

import PredictionModel, {
  Prediction,
  PredictionDocument,
} from '../models/prediction.model';
import { Match, MatchStatus } from '../models/match.model';
import {
  MatchRepository,
  MatchRepositoryImpl,
} from '../repositories/match.repo';
import { Score } from '../../common/score';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';
import { find, head, isNumber, isString, uniq } from 'lodash';

export interface PredictionRepository extends BaseRepository<Prediction> {
  findOrCreateJoker$(
    userId: string,
    roundId: string,
    autoPicked?: boolean,
    roundMatches?: Match[]
  ): Observable<Prediction>;
  findOne$(userId: string, matchId: string): Observable<Prediction>;
  findOneOrCreate$(userId: string, match: Match | string): Observable<Prediction>;
  findOrCreatePredictions$(
    userId: string,
    roundId: string,
    withJoker?: boolean,
    roundMatches?: Match[]
  ): Observable<Prediction[]>;
  findOrCreatePicks$(userId: string, roundId: string, withJoker?: boolean): Observable<Prediction[]>;
  findOneAndUpdate$(userId: string, matchId: string, choice: Score): Observable<Prediction>;
  pickJoker$(userId: string, matchId: string): Observable<Prediction[]>;
  unsetJoker$(userId: string, matchId: string): Observable<Prediction | null>;
}

export class PredictionRepositoryImpl
  extends BaseRepositoryImpl<Prediction, PredictionDocument>
  implements PredictionRepository {
  public static getInstance(matchRepo?: MatchRepository) {
    const matchRepoImpl = matchRepo ?? MatchRepositoryImpl.getInstance(ApiProvider.LIGI);

    return new PredictionRepositoryImpl(matchRepoImpl);
  }

  private matchRepo: MatchRepository;

  constructor(matchRepo: MatchRepository) {
    super(PredictionModel);
    this.matchRepo = matchRepo;
  }

  findOneAndUpdate$(userId: string, matchId: string, choice: Score): Observable<Prediction> {
    return this.matchRepo.findById$(matchId)
      .pipe(
        mergeMap(match => {
          if (!match) {
            return throwError(() => new Error(`matchId ${matchId} not found`))
          }
          if (match.status !== MatchStatus.SCHEDULED) {
            return throwError(`${match.slug} not scheduled to be played`);
          }
          return this.findOne$(userId, matchId)
        }),
        mergeMap(prediction => {
          if (!prediction) {
            return throwError('prediction does not exist');
          }
          return super.findOneAndUpdate$({ user: userId, match: matchId }, { choice, isComputerGenerated: false })
        })
      );
  }

  pickJoker$(userId: string, matchId: string): Observable<Prediction[]> {
    return this.matchRepo.findById$(matchId)
      .pipe(
        mergeMap(match => {
          if (!match) {
            return throwError(`matchId ${matchId} not found`)
          }
          if (match.status !== MatchStatus.SCHEDULED) {
            return throwError(`${match.slug} not scheduled to be played`)
          }
          return this.findOrCreateJoker$(userId, match.gameRound!)
            .pipe(map(currentJoker => ({ match, currentJoker })))
        }),
        mergeMap(({ match, currentJoker }) => {
          return this.findOneOrCreate$(userId, match)
            .pipe(
              mergeMap(newJoker => {
                const jokers = [];
                if (currentJoker.match.toString() === newJoker.match.toString()) {
                  currentJoker.jokerAutoPicked = false;

                  jokers.push(currentJoker);
                } else {
                  currentJoker.hasJoker = false;

                  newJoker.hasJoker = true;
                  newJoker.jokerAutoPicked = false;

                  jokers.push(currentJoker, newJoker);
                }

                return this.updateMany$(jokers)
                  .pipe(
                    map(() => {
                      return {
                        oldJokerMatch: currentJoker.match,
                        newJokerMatch: newJoker.match,
                      }
                    })
                  )
              })
            )
        }),
        mergeMap(({ oldJokerMatch, newJokerMatch }) => {
          return this.findAll$({
            user: userId,
            match: { $in: uniq([oldJokerMatch, newJokerMatch]) }
          })
        })
      )
  }

  unsetJoker$(userId: string, matchId: string): Observable<Prediction | null> {
    return super.findOne$({ user: userId, match: matchId, hasJoker: true })
      .pipe(
        mergeMap(pred => {
          if (pred) {
            pred.hasJoker = false;
            return this.save$(pred)
          }
          return of(null)
        })
      )
  }

  findOrCreatePredictions$(userId: string, roundId: string, withJoker = true, roundMatches: Match[] = []): Observable<Prediction[]> {
    return (roundMatches.length ? of(roundMatches) : this.matchRepo.findAll$({ gameRound: roundId }))
      .pipe(
        mergeMap(matches => {
          if (matches.length === 0) {
            return of([])
          }
          return iif(
            () => withJoker,
            this.findOrCreateJoker$(userId, roundId, withJoker, matches),
            of(undefined)
          ).pipe(
            mergeMap(() => {
              return this.findAll$({
                user: userId,
                match: { $in: matches.map(n => n.id) },
              })
            }),
            mergeMap(predictions => {
              if (matches.length === predictions.length) {
                return of(predictions);
              }
              return from(matches)
                .pipe(
                  filter(match => !predictions.some(p => p.match.toString() === match.id?.toString())),
                  map(match => {
                    const { id: matchId, slug: matchSlug, status: matchStatus } = match;
                    const prediction = {
                      user: userId,
                      match: matchId,
                      matchSlug,
                    } as Prediction;

                    if (matchStatus === MatchStatus.SCHEDULED) {
                      prediction.choice = this.getRandomMatchScore();
                    }
                    return prediction;
                  }),
                  toArray()
                ).pipe(
                  mergeMap(newPredictions => {
                    return this.insertMany$(newPredictions)
                  }),
                  mergeMap(() => {
                    return this.findAll$({
                      user: userId,
                      match: { $in: matches.map(n => n.id) },
                    })
                  })
                )
            }),
          )
        })
      )
  }

  findOrCreatePicks$(userId: string, roundId: string, withJoker = true): Observable<Prediction[]> {
    return this.matchRepo.findAll$({ gameRound: roundId })
      .pipe(
        mergeMap(matches => {
          if (matches.length === 0) {
            return of([])
          }
          return this.findOrCreatePredictions$(userId, roundId, withJoker, matches)
            .pipe(
              mergeMap(predictions => {
                return from(predictions)
                  .pipe(
                    filter(prediction => {
                      const match = find(matches, m => m.id?.toString() === prediction.match.toString());
                      const matchIsScheduled = match?.status === MatchStatus.SCHEDULED;
                      return Boolean(prediction.choice.isComputerGenerated) && Boolean(matchIsScheduled);
                    }),
                    map(prediction => {
                      const isComputerGenerated = false;
                      prediction.choice = this.getRandomMatchScore(isComputerGenerated);
                      return prediction;
                    }),
                    toArray(),
                  )
              }),
              mergeMap(newPicks => {
                return iif(
                  () => Boolean(newPicks.length),
                  this.updateMany$(newPicks),
                  of(undefined))
              }),
              mergeMap(() => {
                return this.findAll$({
                  user: userId,
                  match: { $in: matches.map(m => m.id?.toString()) },
                  'choice.isComputerGenerated': false
                })
              })
            )
        }),
      )
  }

  findOrCreateJoker$(
    userId: string, roundId: string, autoPicked: boolean = true, roundMatches: Match[] = []
  ): Observable<Prediction> {
    return (roundMatches.length ? of(roundMatches) : this.matchRepo.findAll$({ gameRound: roundId }))
      .pipe(
        mergeMap(matches => {
          const matchIds = matches.map(m => m.id?.toString())
          return this.findAll$({
            user: userId,
            match: { $in: matchIds },
            hasJoker: true
          })
            .pipe(
              mergeMap(jokerPredictions => {
                const jokers = [];
                if (jokerPredictions.length === 0) {
                  const selectableMatchIds = matches
                    .filter(m => m.status === MatchStatus.SCHEDULED)
                    .map(m => m.id?.toString());
                  if (selectableMatchIds.length) {
                    const jokerMatchId = selectableMatchIds[Math.floor(Math.random() * selectableMatchIds.length)]!;
                    const { slug: jokerMatchSlug } = matches.find(m => m.id?.toString() === jokerMatchId) as Match
                    const randomMatchScore = this.getRandomMatchScore();
                    const { season } = matches[0];

                    const joker: Prediction = {
                      user: userId,
                      season,
                      match: jokerMatchId,
                      matchSlug: jokerMatchSlug,
                      hasJoker: true,
                      jokerAutoPicked: autoPicked,
                      choice: randomMatchScore,
                    };
                    jokers.push(joker);
                  }
                } else if (jokerPredictions.length > 1) {
                  // poor: use reverse for latest joker; better - use last modified
                  const [, ...otherJokers] = jokerPredictions.reverse();
                  otherJokers.forEach(j => {
                    j.hasJoker = false;
                    j.jokerAutoPicked = false;
                    jokers.push(j);
                  });
                }

                if (jokers.length) {
                  return this.upsertMany$(jokers);
                } else {
                  return of(head(jokerPredictions));
                }
              }),
              catchError((error: any) => {
                return throwError(error);
              }),
              mergeMap(result => {
                if (result.constructor.name === 'BulkWriteResult') {
                  return super.findOne$({
                    user: userId,
                    match: { $in: matchIds },
                    hasJoker: true
                  })
                }
                return of(result as Prediction)
              })
            )
        })
      )
  }

  public findOne$(userId: string, matchId: string) {
    return super.findOne$({ user: userId, match: matchId });
  }

  public findOneOrCreate$(
    userId: string,
    match: Match | string,
  ): Observable<Prediction> {
    return (isString(match) ? this.matchRepo.findById$(match) : of(match))
      .pipe(
        mergeMap(aMatch => {
          if (!aMatch) {
            return throwError(`matchId ${isString(match) ? match : match.id} not found`)
          }

          const { id: matchId, season, slug: matchSlug, status: matchStatus } = aMatch;
          return this.findOne$(userId, matchId!)
            .pipe(
              mergeMap(prediction => {
                if (prediction) {
                  return of(prediction);
                }

                const pred = {
                  user: userId,
                  season,
                  match: matchId,
                  matchSlug,
                } as Prediction;

                if (matchStatus === MatchStatus.SCHEDULED) {
                  pred.choice = this.getRandomMatchScore();
                }
                return this.save$(pred);
              })
            )
        })
      )
  }

  private getRandomMatchScore(isComputerGenerated = true) {
    const scoreList = [
      '0-0',
      '0-0',
      '1-1',
      '1-1',
      '2-2',
      '2-2',
      '1-0',
      '2-0',
      '2-1',
      '3-0',
      '3-1',
      '3-2',
      '0-1',
      '0-2',
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
      isComputerGenerated,
    };
  }
}
