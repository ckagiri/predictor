import { mergeMap } from 'rxjs/operators';
import { expect } from 'chai';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import memoryDb from '../memoryDb';
import { UserScore } from '../../db/models';
import { UserScoreRepositoryImpl } from '../../db/repositories/userScore.repo';
import { ScorePoints } from '../../common/score';

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

    // result 2-1 prediction 1-0
    user1manuVmancPredPoints = {
      correctMatchOutcomePoints: 7,
      exactGoalDifferencePoints: 1,
      closeMatchScorePoints: 0,
      exactTeamScorePoints: 0,
      exactMatchScorePoints: 0,
    };

    // result 2-1 prediction 2-1
    user1cheVarsPredPoints = {
      correctMatchOutcomePoints: 7,
      exactGoalDifferencePoints: 1,
      closeMatchScorePoints: 0,
      exactTeamScorePoints: 2,
      exactMatchScorePoints: 6,
    };

    // result 2-1 prediction 3-0
    user2manuVmancPredPoints = {
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
      .findScoreAndUpsert$(
        {
          leaderboardId,
          userId: userId1,
        },
        user1manuVmancPredPoints,
        {
          matchId: manuVmancId,
          predictionId: user1manuVmancPredId,
          hasJoker: true,
        })
      .subscribe(score => {
        expect(score.correctMatchOutcomes).to.equal(1);
        expect(score.closeMatchScorePoints).to.equal(0);
        expect(score.exactMatchScores).to.equal(0);
        expect(score.resultPoints).to.equal(16);
        expect(score.scorePoints).to.equal(0);
        expect(score.points).to.equal(16);
        expect(score.pointsExcludingJoker).to.equal(8);
        expect(score.matches).to.contain(manuVmancId);
        expect(score.predictions).to.contain(user1manuVmancPredId);
        done();
      });
  });

  it('should update a userScore if it exists', done => {
    // result 2-1 prediction 1-0 (& joker)
    const user1manuVmancPredJokerScore: UserScore = {
      leaderboard: leaderboardId,
      user: userId1,
      matches: [manuVmancId],
      predictions: [user1manuVmancPredId],
      matchesPredicted: 1,
      correctMatchOutcomePoints: 14,
      exactGoalDifferencePoints: 2,
      closeMatchScorePoints: 0,
      exactTeamScorePoints: 0,
      exactMatchScorePoints: 0,
      correctMatchOutcomes: 1,
      closeMatchScores: 0,
      exactMatchScores: 0,
      resultPoints: 16,
      scorePoints: 0,
      points: 16,
      pointsExcludingJoker: 8,
    }

    userScoreRepo.insert$(user1manuVmancPredJokerScore)
      .pipe(
        mergeMap(_ => {
          return userScoreRepo.findScoreAndUpsert$(
            {
              leaderboardId,
              userId: userId1,
            },
            user1cheVarsPredPoints,  // result 2-1 prediction 2-1
            {
              matchId: cheVarsId,
              predictionId: user1cheVarsPredId,
              hasJoker: false,
            });
        })
      ).subscribe(score => {
        expect(score.correctMatchOutcomes).to.equal(2);
        expect(score.closeMatchScores).to.equal(0);
        expect(score.exactMatchScores).to.equal(1);
        expect(score.resultPoints).to.equal(24);
        expect(score.scorePoints).to.equal(8);
        expect(score.points).to.equal(32);
        expect(score.pointsExcludingJoker).to.equal(24);
        expect(score.matches).to.contain(manuVmancId, cheVarsId);
        expect(score.matchesPredicted).to.equal(2)
        expect(score.predictions).to.contain(user1manuVmancPredId, user1cheVarsPredId);
        done();
      });
  });

  it('should find by leaderboard and order by points', done => {
    // result 2-1 prediction 1-0
    const user1manuVmancPredScore: UserScore = {
      leaderboard: leaderboardId,
      user: userId1,
      matches: [manuVmancId],
      predictions: [user1manuVmancPredId],
      matchesPredicted: 1,
      correctMatchOutcomePoints: 7,
      exactGoalDifferencePoints: 1,
      closeMatchScorePoints: 0,
      exactTeamScorePoints: 0,
      exactMatchScorePoints: 0,
      correctMatchOutcomes: 1,
      closeMatchScores: 0,
      exactMatchScores: 0,
      resultPoints: 8,
      scorePoints: 0,
      points: 8,
      pointsExcludingJoker: 8,
    }

    // result 2-1 prediction 3-0
    const user2manuVmancPredScore: UserScore = {
      leaderboard: leaderboardId,
      user: userId2,
      matches: [manuVmancId],
      predictions: [user2manuVmancPredId],
      matchesPredicted: 1,
      correctMatchOutcomePoints: 7,
      exactGoalDifferencePoints: 0,
      closeMatchScorePoints: 0,
      exactTeamScorePoints: 0,
      exactMatchScorePoints: 0,
      correctMatchOutcomes: 1,
      closeMatchScores: 0,
      exactMatchScores: 0,
      resultPoints: 7,
      scorePoints: 0,
      points: 7,
      pointsExcludingJoker: 7,
    }

    userScoreRepo
      .insertMany$([user1manuVmancPredScore, user2manuVmancPredScore])
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
    const user1manuVmancPredScore: UserScore = {
      leaderboard: leaderboardId,
      user: userId1,
      matches: [manuVmancId],
      predictions: [user1manuVmancPredId],
      ...user1manuVmancPredPoints,
      resultPoints: 8,
      scorePoints: 0,
      points: 8,
      positionNew: 1,
      positionOld: 2,
    }

    userScoreRepo
      .insert$(user1manuVmancPredScore)
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
