import { Observable, of } from "rxjs";
import { flatMap } from "rxjs/operators";

import { ScorePoints } from "../../common/score";
import {
  IUserScore,
  IUserScoreDocument,
  UserScore
} from "../models/userScore.model";
import { IBaseRepository, BaseRepository } from "./base.repo";

export interface IUserScoreRepository extends IBaseRepository<IUserScore> {
  findOneAndUpsert$(
    leaderboardId: string,
    userId: string,
    fixtureId: string,
    predictionId: string,
    predictionPoints: ScorePoints,
    hasJoker: boolean
  ): Observable<IUserScore>;
  findByLeaderboardOrderByPoints$(
    leaderboardId: string
  ): Observable<IUserScore[]>;
}

export class UserScoreRepository
  extends BaseRepository<IUserScore, IUserScoreDocument>
  implements IUserScoreRepository {
  static getInstance() {
    return new UserScoreRepository();
  }

  constructor() {
    super(UserScore);
  }

  findOneAndUpsert$(
    leaderboardId: string,
    userId: string,
    fixtureId: string,
    predictionId: string,
    predictionPoints: ScorePoints,
    hasJoker: boolean
  ) {
    const {
      points,
      APoints,
      BPoints,
      MatchOutcomePoints,
      TeamScorePlusPoints,
      ExactScorePoints,
      GoalDifferencePoints,
      TeamScoreMinusPoints
    } = predictionPoints;

    const score: IUserScore = {
      leaderboard: leaderboardId,
      user: userId,
      points,
      APoints,
      BPoints,
      MatchOutcomePoints,
      TeamScorePlusPoints,
      ExactScorePoints,
      GoalDifferencePoints,
      TeamScoreMinusPoints
    };

    return this.findOne$({ leaderboard: leaderboardId, user: userId }).pipe(
      flatMap(standing => {
        if (standing === null) {
          score.fixtures = [fixtureId];
          score.predictions = [predictionId];
          score.pointsExcludingJoker = points;
          score.APointsExcludingJoker = APoints;
          score.BPointsExcludingJoker = BPoints;
          if (hasJoker && points > 0) {
            score.points *= 2;
            score.APoints *= 2;
            score.BPoints *= 2;
            score.MatchOutcomePoints *= 2;
            score.TeamScorePlusPoints *= 2;
            score.ExactScorePoints *= 2;
            score.GoalDifferencePoints *= 2;
            score.TeamScoreMinusPoints *= 2;
          }
          return this.insert$(score);
        } else {
          const fixtures = standing.fixtures as string[];
          const fixtureExists = fixtures.some(n => n.toString() === fixtureId);
          if (fixtureExists) {
            return of(standing);
          }

          standing.pointsExcludingJoker! += points;
          standing.APointsExcludingJoker! += APoints;
          standing.BPointsExcludingJoker! += BPoints;

          const shouldDouble = hasJoker && points > 0;
          standing.MatchOutcomePoints += shouldDouble
            ? MatchOutcomePoints * 2
            : MatchOutcomePoints;
          standing.TeamScorePlusPoints += shouldDouble
            ? TeamScoreMinusPoints * 2
            : TeamScorePlusPoints;
          standing.ExactScorePoints += shouldDouble
            ? ExactScorePoints * 2
            : ExactScorePoints;
          standing.GoalDifferencePoints += shouldDouble
            ? GoalDifferencePoints * 2
            : GoalDifferencePoints;
          standing.TeamScoreMinusPoints += shouldDouble
            ? TeamScoreMinusPoints * 2
            : TeamScoreMinusPoints;
          standing.APoints += shouldDouble ? APoints * 2 : APoints;
          standing.BPoints += shouldDouble ? BPoints * 2 : BPoints;
          standing.points += shouldDouble ? points * 2 : points;

          return this.findByIdAndUpdate$(standing.id!, {
            $set: {
              points: standing.points,
              APoints: standing.APoints,
              BPoints: standing.BPoints,
              MatchOutcomePoints: standing.MatchOutcomePoints,
              TeamScorePlusPoints: standing.TeamScorePlusPoints,
              ExactScorePoints: standing.ExactScorePoints,
              GoalDifferencePoints: standing.GoalDifferencePoints,
              TeamScoreMinusPoints: standing.TeamScoreMinusPoints,
              pointsExcludingJoker: standing.pointsExcludingJoker,
              APointsExcludingJoker: standing.APointsExcludingJoker,
              BPointsExcludingJoker: standing.BPointsExcludingJoker
            },
            $push: { fixtures: fixtureId, predictions: predictionId }
          });
        }
      })
    );
  }

  findByLeaderboardOrderByPoints$(leaderboardId: string) {
    return this.findAll$({ leaderboard: leaderboardId }, null, {
      sort: {
        points: -1,
        APoints: -1,
        BPoints: -1,
        MatchOutcomePoints: -1,
        TeamScorePlusPoints: -1,
        ExactScorePoints: -1,
        GoalDifferencePoints: -1
      }
    });
  }
}
