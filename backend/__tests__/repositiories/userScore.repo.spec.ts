import { mergeMap } from 'rxjs/operators';
import { expect } from 'chai';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import memoryDb from '../memoryDb';
import { Match, Prediction, PredictionDocument, UserScore } from '../../db/models';
import { UserScoreRepositoryImpl } from '../../db/repositories/userScore.repo';
import { ScorePoints, Score } from '../../common/score';

import a from '../a';

const userScoreRepo = UserScoreRepositoryImpl.getInstance();

const epl = a.competition
  .setName('English Premier League')
  .setSlug('english-premier-league')
  .setCode('epl');

const epl2022 = a.season
  .withCompetition(epl)
  .setName('2021-2022')
  .setSlug('2021-22')
  .setYear(2022)
  .setSeasonStart('2021-08-09T00:00:00+0200')
  .setSeasonEnd('2022-05-17T16:00:00+0200')
  .setExternalReference({
    [ApiProvider.API_FOOTBALL_DATA]: { id: 445 },
  })

const manu = a.team.setName('Manchester United').setSlug('man-utd');
const manc = a.team.setName('Manchester City').setSlug('man-city');
const che = a.team.setName('Chelsea').setSlug('chelsea');
const ars = a.team.setName('Arsenal').setSlug('arsenal');

const gw1 = a.gameRound.setName('Gameweek 1').setSlug('gameweek-1').setPosition(1);
const gw2 = a.gameRound.setName('Gameweek 2').setSlug('gameweek-2').setPosition(2);

const user1 = a.user.setUsername('charles').setEmail('charles@email.com');
const user2 = a.user.setUsername('kagiri').setEmail('kagiri@email.com');

const user1_manuVmanc_pred = a.prediction
  .withUser(user1)
  .setHomeScore(1)
  .setAwayScore(0)

const user2_manuVmanc_pred = a.prediction
  .withUser(user2)
  .setHomeScore(3)
  .setAwayScore(0)

const user1_cheVars_pred = a.prediction
  .withUser(user1)
  .setHomeScore(1)
  .setAwayScore(1)

const user2_cheVars_pred = a.prediction
  .withUser(user2)
  .setHomeScore(2)
  .setAwayScore(2)

const manuVmanc = a.match
  .withHomeTeam(manu)
  .withAwayTeam(manc)
  .setDate('2021-08-11T11:30:00Z')
  .withGameRound(gw1)
  .setHomeScore(2)
  .setAwayScore(1)
  .withPredictions(user1_manuVmanc_pred, user2_manuVmanc_pred)

const cheVars = a.match
  .withHomeTeam(che)
  .withAwayTeam(ars)
  .setDate('2021-08-21T11:30:00Z')
  .withGameRound(gw2)
  .setHomeScore(1)
  .setAwayScore(1)
  .withPredictions(user1_cheVars_pred, user2_cheVars_pred);

const eplBoard = a.leaderboard.setBoardType('GLOBAL_SEASON');
const eplGw1Board = a.leaderboard.setBoardType('GLOBAL_ROUND').withGameRound(gw1);

describe('UserScore Repo', function () {
  let leaderboardId: string;
  let userId1: string;
  let userId2: string;
  let matchId1: string;
  let matchId2: string;
  let userId1matchId1Pred: string;
  let userId1matchId2Pred: string;
  let userId2matchId1Pred: string;
  let userId2matchId2Pred: string;
  let user1_manuVmanc_pred_points: ScorePoints;
  let user1_cheVars_pred_points: ScorePoints;
  let user2_manuVmanc_pred_points: ScorePoints;

  before(async () => {
    await memoryDb.connect();
  });

  after(async () => {
    await memoryDb.close();
  });

  afterEach(async () => {
    await memoryDb.dropDb();
  });

  beforeEach(async () => {
    await a.game
      .withTeams(manu, manc, che, ars)
      .withUsers(user1, user2)
      .withCompetitions(epl)
      .withSeasons(
        epl2022
          .withTeams(manu, manc, che, ars)
          .withGameRounds(gw1, gw2)
          .withMatches(manuVmanc, cheVars)
          .withLeaderboards(eplBoard, eplGw1Board)
      )
      .build();
    leaderboardId = eplBoard.id;
    userId1 = user1.id;
    userId2 = user2.id;
    matchId1 = manuVmanc.id;
    matchId2 = cheVars.id;
    userId1matchId1Pred = user1_manuVmanc_pred.id;
    userId1matchId2Pred = user1_cheVars_pred.id;
    userId2matchId1Pred = user2_manuVmanc_pred.id;
    userId2matchId2Pred = user2_cheVars_pred.id;

    // result 2-1 prediction 1-0
    // userId1matchId1Pred
    user1_manuVmanc_pred_points = {
      points: 8,
      resultPoints: 8,
      scorePoints: 0,
      correctMatchOutcomePoints: 7,
      exactGoalDifferencePoints: 1,
      closeMatchScorePoints: 0,
      exactTeamScorePoints: 0,
      exactMatchScorePoints: 0,
    };

    // result 2-1 prediction 2-1
    // userId1matchId2Pred
    user1_cheVars_pred_points = {
      points: 16,
      resultPoints: 8,
      scorePoints: 8,
      correctMatchOutcomePoints: 7,
      exactGoalDifferencePoints: 1,
      closeMatchScorePoints: 0,
      exactTeamScorePoints: 2,
      exactMatchScorePoints: 6,
    };

    // result 2-1 prediction 3-0
    // userId2matchId1Pred
    user2_manuVmanc_pred_points = {
      points: 7,
      resultPoints: 7,
      scorePoints: 0,
      correctMatchOutcomePoints: 7,
      exactGoalDifferencePoints: 0,
      closeMatchScorePoints: 0,
      exactTeamScorePoints: 0,
      exactMatchScorePoints: 0,
    };
  })

  it('should create a userScore if it does not exist', done => {
    // result 2-1 prediction 1-0 (& joker)
    userScoreRepo
      .findScoreAndUpsert$({
        leaderboardId,
        userId: userId1,
        matchId: matchId1,
        predictionId: userId1matchId1Pred,
        hasJoker: true,
      }, { predictionPoints: user1_manuVmanc_pred_points })
      .subscribe(score => {
        expect(score.pointsExcludingJoker).to.equal(8);
        expect(score.correctMatchOutcomes).to.equal(1);
        expect(score.closeMatchScorePoints).to.equal(0);
        expect(score.exactMatchScores).to.equal(0);
        expect(score.points).to.equal(16);
        expect(score.resultPoints).to.equal(16);
        expect(score.scorePoints).to.equal(0);
        expect(score.matches).to.contain(matchId1);
        expect(score.predictions).to.contain(userId1matchId1Pred);
        done();
      });
  });

  it('should update a userScore if it exists', done => {
    // result 2-1 prediction 1-0 (& joker)
    const user1_manuVmanc_predJoker_score: UserScore = {
      leaderboard: leaderboardId,
      user: userId1,
      matches: [matchId1],
      predictions: [userId1matchId1Pred],
      matchesPredicted: 1,
      pointsExcludingJoker: 8,
      correctMatchOutcomes: 1,
      closeMatchScores: 0,
      exactMatchScores: 0,
      points: 16,
      resultPoints: 16,
      scorePoints: 0,
      correctMatchOutcomePoints: 14,
      exactGoalDifferencePoints: 2,
      closeMatchScorePoints: 0,
      exactTeamScorePoints: 0,
      exactMatchScorePoints: 0,
    }

    userScoreRepo.insert$(user1_manuVmanc_predJoker_score)
      .pipe(
        mergeMap(_ => {
          return userScoreRepo.findScoreAndUpsert$({
            leaderboardId,
            userId: userId1,
            matchId: matchId2,
            predictionId: userId1matchId2Pred,
            hasJoker: false,
          }, {
            // result 2-1 prediction 2-1
            predictionPoints: user1_cheVars_pred_points
          });
        })
      ).subscribe(score => {
        expect(score.pointsExcludingJoker).to.equal(24);
        expect(score.correctMatchOutcomes).to.equal(2);
        expect(score.closeMatchScores).to.equal(0);
        expect(score.exactMatchScores).to.equal(1);
        expect(score.points).to.equal(32);
        expect(score.resultPoints).to.equal(24);
        expect(score.scorePoints).to.equal(8);
        expect(score.matches).to.contain(matchId1, matchId2);
        expect(score.matchesPredicted).to.equal(2)
        expect(score.predictions).to.contain(userId1matchId1Pred, userId1matchId2Pred);
        done();
      });
  });

  it('should find by leaderboard and order by points', done => {
    const user1_manuVmanc_pred_score: UserScore = {
      ...user1_manuVmanc_pred_points, // result 2-1 prediction 1-0
      leaderboard: leaderboardId,
      user: userId1,
      matches: [matchId1],
      predictions: [userId1matchId1Pred],
      matchesPredicted: 1,
      pointsExcludingJoker: user1_manuVmanc_pred_points.points,
      correctMatchOutcomes: 1,
      closeMatchScores: 0,
      exactMatchScores: 0,
    }

    const user2_manuVmanc_pred_score: UserScore = {
      ...user2_manuVmanc_pred_points, // result 2-1 prediction 3-0
      leaderboard: leaderboardId,
      user: userId2,
      matches: [matchId1],
      predictions: [userId2matchId1Pred],
      matchesPredicted: 1,
      pointsExcludingJoker: user2_manuVmanc_pred_points.points,
      correctMatchOutcomes: 1,
      closeMatchScores: 0,
      exactMatchScores: 0,
    }

    userScoreRepo
      .insertMany$([user1_manuVmanc_pred_score, user2_manuVmanc_pred_score])
      .pipe(
        mergeMap(_ => {
          return userScoreRepo.findByLeaderboardIdOrderByPoints$(leaderboardId);
        }),
      )
      .subscribe(standings => {
        expect(standings[1].points).to.be.lte(standings[0].points);
        done();
      });
  })

  it('should find by id and update positions', done => {
    const user1_manuVmanc_pred_score: UserScore = {
      ...user1_manuVmanc_pred_points,
      leaderboard: leaderboardId,
      user: userId1,
      matches: [matchId1],
      predictions: [userId1matchId1Pred],
      positionNew: 1,
      positionOld: 2,
    }

    userScoreRepo
      .insert$(user1_manuVmanc_pred_score)
      .pipe(
        mergeMap(userScore => {
          const prevPosition = userScore.positionNew!;
          const positionOld = prevPosition;
          const positionNew = prevPosition + 1;
          return userScoreRepo.findByIdAndUpdate$(userScore.id!, {
            positionNew,
            positionOld,
          });
        }),
      )
      .subscribe(standing => {
        expect(standing.positionNew).to.equal(2);
        expect(standing.positionOld).to.equal(1);
        done();
      });
  });
});
