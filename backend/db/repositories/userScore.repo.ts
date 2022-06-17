import { Observable, of } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

import { ScorePoints } from '../../common/score';
import UserScoreModel, {
  UserScore,
  UserScoreDocument,
} from '../models/userScore.model';
import { BaseRepository, BaseRepositoryImpl } from './base.repo';
export interface UserScoreRepository extends BaseRepository<UserScore> {
  findScoreAndUpsert$({
    leaderboardId,
    userId,
    matchId,
    predictionId,
    hasJoker
  }: {
    leaderboardId: string,
    userId: string,
    matchId: string,
    predictionId: string,
    hasJoker: boolean,
  }, { predictionPoints }: { predictionPoints: ScorePoints }): Observable<UserScore>;

  findByLeaderboardIdOrderByPoints$(
    leaderboardId: string,
  ): Observable<UserScore[]>;
}

export class UserScoreRepositoryImpl
  extends BaseRepositoryImpl<UserScore, UserScoreDocument>
  implements UserScoreRepository {
  public static getInstance() {
    return new UserScoreRepositoryImpl();
  }

  constructor() {
    super(UserScoreModel);
  }

  public findScoreAndUpsert$({
    leaderboardId,
    userId,
    matchId,
    predictionId,
    hasJoker
  }: {
    leaderboardId: string,
    userId: string,
    matchId: string,
    predictionId: string,
    hasJoker: boolean,
  }, { predictionPoints }: { predictionPoints: ScorePoints }) {

    const {
      points,
      resultPoints,
      scorePoints,
      correctMatchOutcomePoints,
      exactGoalDifferencePoints,
      closeMatchScorePoints,
      exactTeamScorePoints,
      exactMatchScorePoints,
    } = predictionPoints;

    const score: UserScore = {
      leaderboard: leaderboardId,
      user: userId,
      points,
      resultPoints,
      scorePoints,
      correctMatchOutcomePoints,
      exactTeamScorePoints,
      exactMatchScorePoints,
      closeMatchScorePoints,
      exactGoalDifferencePoints,
    };

    return this.findOne$({ leaderboard: leaderboardId, user: userId }).pipe(
      mergeMap(userScore => {
        if (userScore === null) {
          score.matches = [matchId];
          score.predictions = [predictionId];
          score.matchesPredicted = 1;
          score.pointsExcludingJoker = points;
          score.resultPointsExcludingJoker = resultPoints;
          score.scorePointsExcludingJoker = scorePoints;

          if (hasJoker) {
            score.points *= 2;
            score.correctMatchOutcomePoints *= 2;
            score.exactGoalDifferencePoints *= 2;
            score.exactMatchScorePoints *= 2;
            score.closeMatchScorePoints *= 2;
            score.exactTeamScorePoints *= 2;

            score.resultPoints *= 2;
            score.scorePoints *= 2;
          }

          return this.insert$(score);
        } else {
          const matches = userScore.matches as string[];
          const matchExists = matches.some(n => n.toString() === matchId);
          if (matchExists) {
            return of(userScore);
          }

          userScore.pointsExcludingJoker! += points;
          userScore.correctMatchOutcomePoints += hasJoker
            ? correctMatchOutcomePoints * 2
            : correctMatchOutcomePoints;
          userScore.exactGoalDifferencePoints += hasJoker
            ? exactGoalDifferencePoints * 2
            : exactGoalDifferencePoints;
          userScore.closeMatchScorePoints += hasJoker
            ? closeMatchScorePoints * 2
            : closeMatchScorePoints;
          userScore.exactMatchScorePoints += hasJoker
            ? exactMatchScorePoints * 2
            : exactMatchScorePoints;
          userScore.exactTeamScorePoints += hasJoker
            ? exactTeamScorePoints * 2
            : exactTeamScorePoints;

          userScore.resultPointsExcludingJoker! += resultPoints;
          userScore.scorePointsExcludingJoker! += scorePoints;

          userScore.resultPoints += (userScore.correctMatchOutcomePoints + userScore.exactGoalDifferencePoints);
          userScore.scorePoints += (userScore.closeMatchScorePoints + userScore.exactTeamScorePoints +
            userScore.exactMatchScorePoints);
          userScore.points += (userScore.resultPoints + userScore.scorePoints);

          return this.findByIdAndUpdate$(userScore.id!, {
            $set: {
              points: userScore.points,
              ResultPoints: userScore.resultPoints,
              ScorePoints: userScore.scorePoints,
              CorrectMatchOutcomePoints: userScore.correctMatchOutcomePoints,
              ExactGoalDifferencePoints: userScore.exactGoalDifferencePoints,
              ExactMatchScorePoints: userScore.exactMatchScorePoints,
              ExactTeamScorePoints: userScore.exactTeamScorePoints,
              CloseMatchScorePoints: userScore.closeMatchScorePoints,
              pointsExcludingJoker: userScore.pointsExcludingJoker,
              ResultPointsExcludingJoker: userScore.resultPointsExcludingJoker,
              ScorePointsExcludingJoker: userScore.scorePointsExcludingJoker,
            },
            $inc: { matchesPredicted: 1 },
            $push: { matches: matchId, predictions: predictionId },
          });
        }
      }),
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
