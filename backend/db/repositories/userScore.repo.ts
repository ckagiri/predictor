import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ScorePoints } from '../../common/score';
import UserScoreModel, {
  UserScore
} from '../models/userScore.model';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';

type Query = {
  leaderboardId: string,
  userId: string,
}

type Metadata = {
  matchId: string,
  predictionId: string,
  hasJoker: boolean,
}
export interface UserScoreRepository extends BaseRepository<UserScore> {
  findScoreAndUpsert$(
    query: Query,
    predictionPoints: ScorePoints,
    rest: Metadata
  ): Observable<UserScore>;

  findByLeaderboardIdOrderByPoints$(
    leaderboardId: string,
  ): Observable<UserScore[]>;
}

export class UserScoreRepositoryImpl
  extends BaseRepositoryImpl<UserScore>
  implements UserScoreRepository {
  public static getInstance() {
    return new UserScoreRepositoryImpl();
  }

  constructor() {
    super(UserScoreModel);
  }

  findScoreAndUpsert$(
    query: Query,
    predictionPoints: ScorePoints,
    rest: Metadata
  ): Observable<UserScore> {
    const { leaderboardId, userId } = query;
    const {
      correctMatchOutcomePoints,
      exactGoalDifferencePoints,
      closeMatchScorePoints,
      exactTeamScorePoints,
      exactMatchScorePoints,
    } = predictionPoints;
    const { matchId, predictionId, hasJoker } = rest;
    const resultPoints = correctMatchOutcomePoints + exactGoalDifferencePoints;
    const scorePoints = closeMatchScorePoints + exactTeamScorePoints + exactMatchScorePoints;
    const points = resultPoints + scorePoints;

    let score: UserScore = {
      leaderboard: leaderboardId,
      user: userId,
      correctMatchOutcomePoints,
      exactTeamScorePoints,
      exactMatchScorePoints,
      closeMatchScorePoints,
      exactGoalDifferencePoints,
      resultPoints,
      scorePoints,
      points,
    };

    return this.findOne$({ leaderboard: leaderboardId, user: userId }).pipe(
      mergeMap(userScore => {
        if (userScore == null) {
          score.matches = [matchId];
          score.predictions = [predictionId];
          score.matchesPredicted = 1;
          score.correctMatchOutcomes = correctMatchOutcomePoints / 7;
          score.closeMatchScores = closeMatchScorePoints;
          score.exactMatchScores = exactMatchScorePoints / 6;
          score.pointsExcludingJoker = points;

          if (hasJoker) {
            score.correctMatchOutcomePoints *= 2;
            score.exactGoalDifferencePoints *= 2;
            score.exactMatchScorePoints *= 2;
            score.closeMatchScorePoints *= 2;
            score.exactTeamScorePoints *= 2;

            score.resultPoints *= 2;
            score.scorePoints *= 2;
            score.points *= 2;
          }

          return this.insert$(score);
        } else {
          const matches = userScore.matches as string[];
          const matchExists = matches.some(m => m.toString() === matchId);
          if (matchExists) {
            return of(userScore);
          }

          userScore.correctMatchOutcomePoints += hasJoker ?
            correctMatchOutcomePoints * 2 : correctMatchOutcomePoints;
          userScore.exactGoalDifferencePoints += hasJoker ?
            exactGoalDifferencePoints * 2 : exactGoalDifferencePoints;
          userScore.closeMatchScorePoints += hasJoker ?
            closeMatchScorePoints * 2 : closeMatchScorePoints;
          userScore.exactTeamScorePoints += hasJoker ?
            exactTeamScorePoints * 2 : exactTeamScorePoints;
          userScore.exactMatchScorePoints += hasJoker ?
            exactMatchScorePoints * 2 : exactMatchScorePoints;

          userScore.resultPoints += hasJoker ? resultPoints * 2 : resultPoints;
          userScore.scorePoints += hasJoker ? scorePoints * 2 : scorePoints;
          userScore.points += hasJoker ? points * 2 : points;

          userScore.pointsExcludingJoker! += points;
          userScore.correctMatchOutcomes! += (correctMatchOutcomePoints / 7);
          userScore.closeMatchScores! += closeMatchScorePoints;
          userScore.exactMatchScores! += (exactMatchScorePoints / 6);

          return this.findByIdAndUpdate$(userScore.id!, {
            $set: {
              resultPoints: userScore.resultPoints,
              scorePoints: userScore.scorePoints,
              points: userScore.points,
              correctMatchOutcomePoints: userScore.correctMatchOutcomePoints,
              exactGoalDifferencePoints: userScore.exactGoalDifferencePoints,
              closeMatchScorePoints: userScore.closeMatchScorePoints,
              exactTeamScorePoints: userScore.exactTeamScorePoints,
              exactMatchScorePoints: userScore.exactMatchScorePoints,
              pointsExcludingJoker: userScore.pointsExcludingJoker,
              correctMatchOutcomes: userScore.correctMatchOutcomes,
              closeMatchScores: userScore.closeMatchScores,
              exactMatchScores: userScore.exactMatchScores,
            },
            $inc: { matchesPredicted: 1 },
            $push: { matches: matchId, predictions: predictionId },
          });
        }
      })
    );
  }

  public findByLeaderboardIdOrderByPoints$(leaderboardId: string) {
    return this.findAll$({ leaderboard: leaderboardId }, null, {
      sort: {
        points: -1,
        resultPoints: -1,
        scorePoints: -1,
        correctMatchOutcomePoints: -1,
        exactGoalDifferencePoints: -1,
        closeMatchScorePoints: -1,
        exactTeamScorePoints: -1,
        exactMatchScorePoints: -1,
      },
    });
  }
}
