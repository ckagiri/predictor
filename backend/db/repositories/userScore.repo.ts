import { EMPTY, Observable, of } from 'rxjs';
import { mergeMap, throwIfEmpty } from 'rxjs/operators';

import { ScorePoints } from '../../common/score.js';
import UserScoreModel, { UserScore } from '../models/userScore.model.js';
import { BaseRepository, BaseRepositoryImpl } from './base.repo.js';

export interface UserScoreRepository extends BaseRepository<UserScore> {
  findByLeaderboardIdOrderByPoints$(
    leaderboardId: string
  ): Observable<UserScore[]>;

  findScoreAndUpsert$(
    query: Query,
    predictionPoints: ScorePoints,
    rest: Metadata
  ): Observable<UserScore>;
}

interface Metadata {
  hasJoker: boolean;
  matchId: string;
  predictionId: string;
}
interface Query {
  leaderboardId: string;
  userId: string;
}

export class UserScoreRepositoryImpl
  extends BaseRepositoryImpl<UserScore>
  implements UserScoreRepository
{
  constructor() {
    super(UserScoreModel);
  }

  static getInstance() {
    return new UserScoreRepositoryImpl();
  }

  findByLeaderboardIdOrderByPoints$(leaderboardId: string) {
    return this.findAll$({ leaderboard: leaderboardId }, null, {
      sort: {
        closeMatchScorePoints: -1,
        correctMatchOutcomePoints: -1,
        exactGoalDifferencePoints: -1,
        exactMatchScorePoints: -1,
        points: -1,
      },
    });
  }

  findScoreAndUpsert$(
    query: Query,
    predictionPoints: ScorePoints,
    rest: Metadata
  ): Observable<UserScore> {
    const { leaderboardId, userId } = query;
    const {
      closeMatchScorePoints,
      correctMatchOutcomePoints,
      correctTeamScorePoints,
      exactGoalDifferencePoints,
      exactMatchScorePoints,
    } = predictionPoints;
    const { hasJoker, matchId, predictionId } = rest;
    const basePoints =
      correctMatchOutcomePoints +
      exactGoalDifferencePoints +
      closeMatchScorePoints +
      correctTeamScorePoints +
      exactMatchScorePoints;

    const score: UserScore = {
      basePoints,
      closeMatchScorePoints,
      correctMatchOutcomePoints,
      correctTeamScorePoints,
      exactGoalDifferencePoints,
      exactMatchScorePoints,
      leaderboard: leaderboardId,
      points: basePoints,
      user: userId,
    };

    return this.findOne$({ leaderboard: leaderboardId, user: userId }).pipe(
      mergeMap(userScore => {
        if (userScore === null) {
          score.matches = [matchId];
          score.matchesPredicted = 1;
          score.correctMatchOutcomes = correctMatchOutcomePoints / 7;
          score.exactMatchScores = exactMatchScorePoints / 10;
          score.exactGoalDiffs = exactGoalDifferencePoints;
          score.closeMatchScores = Math.ceil(closeMatchScorePoints / 2);

          if (hasJoker) {
            score.points += basePoints;
          }

          return this.create$(score);
        } else {
          const matches = userScore.matches!;
          const matchExists = matches.some(m => m.toString() === matchId);
          if (matchExists) {
            return of(userScore);
          }

          userScore.correctMatchOutcomePoints += correctMatchOutcomePoints;
          userScore.exactGoalDifferencePoints += exactGoalDifferencePoints;
          userScore.closeMatchScorePoints += closeMatchScorePoints;
          userScore.correctTeamScorePoints += correctTeamScorePoints;
          userScore.exactMatchScorePoints += exactMatchScorePoints;

          userScore.basePoints += basePoints;
          userScore.points += hasJoker ? basePoints * 2 : basePoints;

          userScore.correctMatchOutcomes! += correctMatchOutcomePoints / 7;
          userScore.exactMatchScores! += exactMatchScorePoints / 10;
          userScore.exactGoalDiffs! += exactGoalDifferencePoints;
          userScore.closeMatchScores! += Math.ceil(closeMatchScorePoints / 2);

          return this.findByIdAndUpdate$(userScore.id!, {
            $inc: { matchesPredicted: 1 },
            $push: { matches: matchId, predictions: predictionId },
            $set: {
              basePoints: userScore.basePoints,
              closeMatchScorePoints: userScore.closeMatchScorePoints,
              closeMatchScores: userScore.closeMatchScores,
              correctMatchOutcomePoints: userScore.correctMatchOutcomePoints,
              correctMatchOutcomes: userScore.correctMatchOutcomes,
              correctTeamScorePoints: userScore.correctTeamScorePoints,
              exactGoalDifferencePoints: userScore.exactGoalDifferencePoints,
              exactGoalDiffs: userScore.exactGoalDiffs,
              exactMatchScorePoints: userScore.exactMatchScorePoints,
              exactMatchScores: userScore.exactMatchScores,
              points: userScore.points,
            },
          }).pipe(
            mergeMap(s => (s ? of(s) : EMPTY)),
            throwIfEmpty(() => new Error(`userscore: ${String(userScore.id)}`))
          );
        }
      })
    );
  }
}
