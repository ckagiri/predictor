import { expect } from 'chai';
import { mergeMap } from 'rxjs/operators';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { ScorePoints } from '../../common/score';
import { UserScore } from '../../db/models';
import { UserScoreRepositoryImpl } from '../../db/repositories/userScore.repo';
import a from '../a';
import memoryDb from '../memoryDb';

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
  });

const manu = a.team.setName('Manchester United').setSlug('man-utd');
const manc = a.team.setName('Manchester City').setSlug('man-city');
const che = a.team.setName('Chelsea').setSlug('chelsea');
const ars = a.team.setName('Arsenal').setSlug('arsenal');

const gw1 = a.gameRound
  .setName('Gameweek 1')
  .setSlug('gameweek-1')
  .setPosition(1);
const gw2 = a.gameRound
  .setName('Gameweek 2')
  .setSlug('gameweek-2')
  .setPosition(2);

const user1 = a.user.setUsername('charles');
const user2 = a.user.setUsername('kagiri');

const user1_manuVmanc_pred = a.prediction
  .withUser(user1)
  .setHomeScore(1)
  .setAwayScore(0);

const user2_manuVmanc_pred = a.prediction
  .withUser(user2)
  .setHomeScore(3)
  .setAwayScore(0);

const user1_cheVars_pred = a.prediction
  .withUser(user1)
  .setHomeScore(1)
  .setAwayScore(1);

const user2_cheVars_pred = a.prediction
  .withUser(user2)
  .setHomeScore(2)
  .setAwayScore(2);

const manuVmanc = a.match
  .withHomeTeam(manu)
  .withAwayTeam(manc)
  .setDate('2021-08-11T11:30:00Z')
  .withGameRound(gw1)
  .setHomeScore(2)
  .setAwayScore(1)
  .withPredictions(user1_manuVmanc_pred, user2_manuVmanc_pred);

const cheVars = a.match
  .withHomeTeam(che)
  .withAwayTeam(ars)
  .setDate('2021-08-21T11:30:00Z')
  .withGameRound(gw2)
  .setHomeScore(1)
  .setAwayScore(1)
  .withPredictions(user1_cheVars_pred, user2_cheVars_pred);

const eplBoard = a.leaderboard.setBoardType('GLOBAL_SEASON');
const eplGw1Board = a.leaderboard
  .setBoardType('GLOBAL_ROUND')
  .withGameRound(gw1);

describe('UserScore Repo', function () {
  let leaderboardId: string;
  let userId1: string;
  let userId2: string;
  let manuVmancId: string;
  let cheVarsId: string;
  let user1manuVmancPredId: string;
  let user1cheVarsPredId: string;
  let user2manuVmancPredId: string;
  let user1manuVmancPredPoints: ScorePoints;
  let user1cheVarsPredPoints: ScorePoints;
  let user2manuVmancPredPoints: ScorePoints;

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
    manuVmancId = manuVmanc.id;
    cheVarsId = cheVars.id;
    user1manuVmancPredId = user1_manuVmanc_pred.id;
    user1cheVarsPredId = user1_cheVars_pred.id;
    user2manuVmancPredId = user2_manuVmanc_pred.id;

    // manuVmanc 2-1
    // result 2-1 prediction 1-0
    user1manuVmancPredPoints = {
      closeMatchScorePoints: 1,
      correctMatchOutcomePoints: 7,
      exactGoalDifferencePoints: 1,
      exactMatchScorePoints: 0,
      exactTeamScorePoints: 0,
    };
    // result 2-1 prediction 3-0
    user2manuVmancPredPoints = {
      closeMatchScorePoints: 1,
      correctMatchOutcomePoints: 7,
      exactGoalDifferencePoints: 0,
      exactMatchScorePoints: 0,
      exactTeamScorePoints: 0,
    };

    // cheVars 1-1
    // result 1-1 prediction 1-1
    user1cheVarsPredPoints = {
      closeMatchScorePoints: 0,
      correctMatchOutcomePoints: 7,
      exactGoalDifferencePoints: 1,
      exactMatchScorePoints: 10,
      exactTeamScorePoints: 2,
    };
  });

  it('should create a userScore if it does not exist', done => {
    // result 2-1 prediction 1-0 (& joker)
    userScoreRepo
      .findScoreAndUpsert$(
        {
          leaderboardId,
          userId: userId1,
        },
        user1manuVmancPredPoints,
        {
          hasJoker: true,
          matchId: manuVmancId,
          predictionId: user1manuVmancPredId,
        }
      )
      .subscribe(score => {
        expect(score.correctMatchOutcomes).to.equal(1);
        expect(score.closeMatchScorePoints).to.equal(1);
        expect(score.exactMatchScores).to.equal(0);
        expect(score.points).to.equal(18);
        expect(score.basePoints).to.equal(9);
        expect(score.matches?.map(m => m.toString())).to.contain(manuVmancId);
        done();
      });
  });

  it('should update a userScore if it exists', done => {
    // result 2-1 prediction 1-0 (& joker)
    const user1manuVmancPredJokerScore: UserScore = {
      basePoints: 9,
      closeMatchScorePoints: 1,
      closeMatchScores: 1,
      correctMatchOutcomePoints: 7,
      correctMatchOutcomes: 1,
      exactGoalDifferencePoints: 1,
      exactGoalDiffs: 1,
      exactMatchScorePoints: 0,
      exactMatchScores: 0,
      exactTeamScorePoints: 0,
      leaderboard: leaderboardId,
      matches: [manuVmancId],
      matchesPredicted: 1,
      points: 18,
      user: userId1,
    };

    userScoreRepo
      .create$(user1manuVmancPredJokerScore)
      .pipe(
        mergeMap(_ => {
          return userScoreRepo.findScoreAndUpsert$(
            {
              leaderboardId,
              userId: userId1,
            },
            user1cheVarsPredPoints, // result 2-1 prediction 2-1
            {
              hasJoker: false,
              matchId: cheVarsId,
              predictionId: user1cheVarsPredId,
            }
          );
        })
      )
      .subscribe(score => {
        expect(score.correctMatchOutcomes).to.equal(2);
        expect(score.exactMatchScores).to.equal(1);
        expect(score.points).to.equal(38);
        expect(score.basePoints).to.equal(29);
        expect(score.matches?.map(m => m.toString())).to.contain(
          manuVmancId,
          cheVarsId
        );
        expect(score.matchesPredicted).to.equal(2);
        done();
      });
  });

  it('should find by leaderboard and order by points', done => {
    // result 2-1 prediction 1-0
    const user1manuVmancPredScore: UserScore = {
      basePoints: 9,
      closeMatchScorePoints: 1,
      closeMatchScores: 0,
      correctMatchOutcomePoints: 7,
      correctMatchOutcomes: 1,
      exactGoalDifferencePoints: 1,
      exactGoalDiffs: 1,
      exactMatchScorePoints: 0,
      exactMatchScores: 0,
      exactTeamScorePoints: 0,
      leaderboard: leaderboardId,
      matches: [manuVmancId],
      matchesPredicted: 1,
      points: 9,
      user: userId1,
    };

    // result 2-1 prediction 3-0
    const user2manuVmancPredScore: UserScore = {
      basePoints: 8,
      closeMatchScorePoints: 1,
      closeMatchScores: 0,
      correctMatchOutcomePoints: 7,
      correctMatchOutcomes: 1,
      exactGoalDifferencePoints: 0,
      exactGoalDiffs: 0,
      exactMatchScorePoints: 0,
      exactMatchScores: 0,
      exactTeamScorePoints: 0,
      leaderboard: leaderboardId,
      matches: [manuVmancId],
      matchesPredicted: 1,
      points: 8,
      user: userId2,
    };

    userScoreRepo
      .insertMany$([user1manuVmancPredScore, user2manuVmancPredScore])
      .pipe(
        mergeMap(_ => {
          return userScoreRepo.findByLeaderboardIdOrderByPoints$(leaderboardId);
        })
      )
      .subscribe(standings => {
        expect(standings[1].points).to.be.lt(standings[0].points);
        done();
      });
  });

  it('should find by id and update positions', done => {
    // result 2-1 prediction 1-0
    const user1manuVmancPredScore: UserScore = {
      leaderboard: leaderboardId,
      matches: [manuVmancId],
      user: userId1,
      ...user1manuVmancPredPoints,
      basePoints: 9,
      points: 9,
      positionNew: 1,
      positionOld: 2,
    };

    userScoreRepo
      .create$(user1manuVmancPredScore)
      .pipe(
        mergeMap(userScore => {
          const prevPosition = userScore.positionNew!;
          const positionOld = prevPosition;
          const positionNew = prevPosition + 1;
          return userScoreRepo.findByIdAndUpdate$(userScore.id!, {
            positionNew,
            positionOld,
          });
        })
      )
      .subscribe(standing => {
        expect(standing?.positionNew).to.equal(2);
        expect(standing?.positionOld).to.equal(1);
        done();
      });
  });
});
