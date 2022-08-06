import { Observable, of, from, throwError, iif } from 'rxjs';
import { filter, mergeMap, map, catchError, toArray, concatMap } from 'rxjs/operators';
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
  findOne$(userId: string, matchId: string): Observable<Prediction>;
  findOrCreatePredictions$(userId: string, roundId: string, withJoker?: boolean, roundMatches?: Match[]): Observable<Prediction[]>
  findOrCreatePicks$(userId: string, roundId: string, withJoker?: boolean): Observable<Prediction[]>;
  pickScore$(userId: string, match: Match, choice: Score): Observable<Prediction>;
  pickJoker$(userId: string, roundId: string, matchId: string): Observable<Prediction[]>;
  unsetJoker$(userId: string, matchId: string): Observable<Prediction | undefined>;
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

  pickScore$(userId: string, match: Match, choice: Score): Observable<Prediction> {
    if (!match) {
      return throwError(() => new Error('Match not found in round'))
    }
    if (match.status !== MatchStatus.SCHEDULED) {
      return throwError(() => new Error("Match not scheduled"))
    }
    const matchId = match.id!;
    const roundId = match.gameRound.toString();
    return this.findOne$(userId, matchId)
      .pipe(
        map(prediction => ({ match, prediction })),
        mergeMap(({ match, prediction }) => {
          if (!prediction) {
            return this.findOrCreatePredictions$(userId, roundId)
              .pipe(
                map(predictions => {
                  const pickPrediction = predictions.find(p => p.match.toString() === match.id);
                  return pickPrediction
                })
              )
          }
          return of(prediction)
        }),
        mergeMap(prediction => {
          if (!prediction) {
            return throwError(() => new Error('prediction does not exist'));
          }
          return this.findByIdAndUpdate$(prediction?.id!, { choice: { ...choice, isComputerGenerated: false } })
        })
      )
  }

  pickJoker$(userId: string, roundId: string, matchId: string): Observable<Prediction[]> {
    return this.matchRepo.findAll$({ gameRound: roundId })
      .pipe(
        mergeMap(matches => {
          const match = matches.find(m => m.id?.toString() === matchId);
          if (!match) {
            return throwError(() => new Error('Match not found in round'))
          }
          const areAllMatchesFinished = matches.every(m => m.status === MatchStatus.FINISHED);
          if (areAllMatchesFinished) {
            return throwError(() => new Error('All matches finished for the round'))
          }
          return this.findJoker$(userId, roundId, matches)
            .pipe(
              mergeMap(currentJoker => {
                if (!currentJoker) {
                  return this.findOrCreatePredictions$(userId, roundId, true, matches)
                    .pipe(
                      map(predictions => {
                        const currentJoker = predictions.find(p => p.hasJoker === true);
                        return ({ matches, currentJoker: currentJoker })
                      })
                    )
                }
                return of({ matches, currentJoker })
              })
            )
        }),
        mergeMap(({ matches, currentJoker }) => {
          if (!currentJoker) {
            return throwError(() => new Error("Could not find or create round joker."))
          }
          if (currentJoker.match === matchId && currentJoker.jokerAutoPicked === false) {
            return of([currentJoker])
          }
          const currentJokerMatch = matches.find(m => m.id?.toString() === currentJoker.id?.toString());
          if (currentJokerMatch?.status == MatchStatus.FINISHED) {
            return throwError(() => new Error("Current joker match already played."))
          }
          const newJokerMatch = matches.find(m => m.id?.toString() === matchId);
          if (newJokerMatch?.status !== MatchStatus.SCHEDULED) {
            return throwError(() => new Error("New joker match not scheduled."))
          }
          return this.findOneOrCreate$(userId, newJokerMatch)
            .pipe(
              mergeMap(newJoker => {
                const jokers = [];
                if (currentJoker.match === newJoker.match) {
                  currentJoker.jokerAutoPicked = false;
                  jokers.push(currentJoker);
                } else {
                  currentJoker.hasJoker = false;
                  currentJoker.jokerAutoPicked = false;

                  newJoker.hasJoker = true;
                  newJoker.jokerAutoPicked = false;

                  jokers.push(currentJoker, newJoker);
                }

                return this.updateMany$(jokers)
                  .pipe(
                    map(() => ({
                      oldJokerMatch: currentJoker.match,
                      newJokerMatch: newJoker.match,
                    }))
                  )
              }),
              mergeMap(({ oldJokerMatch, newJokerMatch }) => {
                return this.findAll$({
                  user: userId,
                  match: { $in: uniq([oldJokerMatch, newJokerMatch]) }
                })
              })
            )
        })
      )
  }

  unsetJoker$(userId: string, matchId: string): Observable<Prediction | undefined> {
    return super.findOne$({ user: userId, match: matchId, hasJoker: true })
      .pipe(
        mergeMap(pred => {
          if (pred) {
            pred.hasJoker = false;
            return this.save$(pred)
          }
          return of(undefined)
        })
      )
  }

  findOrCreatePredictions$(userId: string, roundId: string, withJoker = true, roundMatches: Match[] = []): Observable<Prediction[]> {
    return (roundMatches.length ? of(roundMatches) : this.matchRepo.findAll$({ gameRound: roundId }))
      .pipe(
        mergeMap(matches => {
          return iif(
            () => withJoker,
            this.findOrCreateJoker$(userId, roundId, matches),
            of(undefined)
          ).pipe(map(() => matches))
        }),
        mergeMap(matches => {
          return this.findAll$({
            user: userId,
            match: { $in: matches.map(n => n.id) },
          })
            .pipe(
              map(predictions => ({ matches, predictions }))
            )
        }),
        mergeMap(({ matches, predictions }) => {
          const areAllMatchesFinished = matches.every(m => m.status === MatchStatus.FINISHED);
          if (areAllMatchesFinished) {
            return of(predictions);
          }

          const scheduledMatches: Match[] = matches.filter(m => m.status === MatchStatus.SCHEDULED);
          if (scheduledMatches.length === predictions.length) {
            return of(predictions);
          }

          const predictionMatchIds: string[] = predictions.map(p => p.match.toString());
          const newPredictionMatches = scheduledMatches.filter(m => !predictionMatchIds.includes(m.id!));
          const newPredictions = newPredictionMatches.map(match => {
            const { id: matchId, slug: matchSlug, season } = match;
            const prediction = {
              user: userId,
              season,
              match: matchId,
              matchSlug,
              choice: this.getRandomMatchScore(),
            } as Prediction;
            return prediction
          });
          return this.insertMany$(newPredictions)
            .pipe(
              mergeMap(() => {
                return this.findAll$({
                  user: userId,
                  match: { $in: matches.map(n => n.id) },
                })
              })
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
                      return Boolean(prediction.choice.isComputerGenerated);
                    }),
                    map(prediction => {
                      const isComputerGenerated = false;
                      prediction.choice = this.getRandomMatchScore(isComputerGenerated); // use VosePredictor
                      if (!!prediction.hasJoker) {
                        prediction.jokerAutoPicked = false;
                      }
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

  findJoker$(userId: string, roundId: string, roundMatches: Match[] = []): Observable<Prediction> {
    return (roundMatches.length ? of(roundMatches) : this.matchRepo.findAll$({ gameRound: roundId }))
      .pipe(
        mergeMap(matches => {
          const matchIds = matches.map(m => m.id?.toString())
          return super.findOne$({
            user: userId,
            match: { $in: matchIds },
            hasJoker: true
          })
        })
      )
  }

  createJoker$(userId: string, roundId: string, roundMatches?: Match[] | undefined): Observable<Prediction> {
    throw new Error('Method not implemented.');
  }

  findOrCreateJoker$(
    userId: string, roundId: string, roundMatches: Match[] = []
  ): Observable<Prediction> { // can return undefined
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
                    const jokerMatch = matches.find(m => m.id?.toString() === jokerMatchId) as Match;

                    const { season, slug: jokerMatchSlug } = jokerMatch;
                    const randomMatchScore = this.getRandomMatchScore();
                    const joker: Prediction = {
                      user: userId,
                      season,
                      match: jokerMatchId,
                      matchSlug: jokerMatchSlug,
                      hasJoker: true,
                      jokerAutoPicked: true,
                      choice: randomMatchScore,
                    };
                    jokers.push(joker);
                  }
                } else if (jokerPredictions.length > 1) { // Precautionary - this should never happen
                  // poor - using reverse for latest joker; better - use last modified
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
                return throwError(() => error);
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
    aMatch: Match
  ): Observable<Prediction> {
    if (!aMatch) {
      return throwError(() => new Error('Match does not exist'))
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
