import { flatMap } from 'rxjs/operators';
import { expect } from 'chai';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import memoryDb from '../memoryDb';
import { Match, Prediction, PredictionDocument } from '../../db/models';
import { UserScoreRepositoryImpl } from '../../db/repositories/userScore.repo';
import { ScorePoints, Score } from '../../common/score';

import a from '../a';

const userScoreRepo = UserScoreRepositoryImpl.getInstance();

const epl = a.competition
  .name('English Premier League')
  .slug('english-premier-league')
  .code('epl');

const epl2022 = a.season
  .withCompetition(epl)
  .name('2021-2022')
  .slug('2021-22')
  .year(2022)
  .seasonStart('2021-08-09T00:00:00+0200')
  .seasonEnd('2022-05-17T16:00:00+0200')
  .externalReference({
    [ApiProvider.API_FOOTBALL_DATA]: { id: 445 },
  })

const manu = a.team.name('Manchester United').slug('man-utd');
const manc = a.team.name('Manchester City').slug('man-city');
const che = a.team.name('Chelsea').slug('chelsea');
const ars = a.team.name('Arsenal').slug('arsenal');

const gw1 = a.gameRound.name('Gameweek 1').position(1);
const gw2 = a.gameRound.name('Gameweek 2').position(2);

const user1 = a.user.username('charles').email('charles@email.com');
const user2 = a.user.username('kagiri').email('kagiri@email.com');

const user1_manuVmanc_pred = a.prediction
  .withUser(user1)
  .homeScore(1)
  .awayScore(0)

const user2_manuVmanc_pred = a.prediction
  .withUser(user2)
  .homeScore(3)
  .awayScore(0)

const user1_cheVars_pred = a.prediction
  .withUser(user1)
  .homeScore(1)
  .awayScore(1)

const user2_cheVars_pred = a.prediction
  .withUser(user2)
  .homeScore(2)
  .awayScore(2)

const manuVmanc = a.match
  .withHomeTeam(manu)
  .withAwayTeam(manc)
  .date('2021-08-11T11:30:00Z')
  .withGameRound(gw1)
  .homeScore(2)
  .awayScore(1)
  .withPredictions(user1_manuVmanc_pred, user2_manuVmanc_pred)

const cheVars = a.match
  .withHomeTeam(che)
  .withAwayTeam(ars)
  .date('2021-08-21T11:30:00Z')
  .withGameRound(gw2)
  .homeScore(1)
  .awayScore(1)
  .withPredictions(user1_cheVars_pred, user2_cheVars_pred);

describe('UserScore Repo', function () {
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
    const gameData = await a.game
      .withTeams(manu, manc, che, ars)
      .withUsers(user1, user2)
      .withCompetitions(epl)
      .withSeasons(
        epl2022
          .withTeams(manu, manc, che, ars)
          .withGameRounds(gw1, gw2)
          .withMatches(manuVmanc, cheVars)
      )
      .build();

    const season = gameData.seasons[0];
  })

  describe('find and upsert', () => {
    it('should create a userScore if it does not exist', done => {
      // result 2-1 prediction 1-0
      const user1_manuVmanc_pred: ScorePoints = {
        points: 8,
        APoints: 8,
        BPoints: 0,
        CorrectMatchOutcomePoints: 7,
        ExactGoalDifferencePoints: 1,
        ExactMatchScorePoints: 0,
        CloseMatchScorePoints: 0,
        ExactTeamScorePoints: 0,
      };
      expect(1).to.eq(1);
      done();
    });
  });
});
