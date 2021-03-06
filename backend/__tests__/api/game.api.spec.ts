import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiHttp = require('chai-http');
import memoryDb from '../memoryDb';
import a, { GameData } from '../a';
import { setupReqRes } from './testUtils';
import { GameController } from '../../app/api/game/game.controller';
import { CompetitionRepositoryImpl } from '../../db/repositories/competition.repo';
import { MatchRepositoryImpl } from '../../db/repositories/match.repo';
import { SeasonRepositoryImpl } from '../../db/repositories/season.repo';
import { TeamRepositoryImpl } from '../../db/repositories/team.repo';

chai.use(chaiHttp);
chai.use(sinonChai);
const expect = chai.expect;

const liverpool = a.team.name('Liverpool').slug('liverpool');
const chelsea = a.team.name('Chelsea').slug('chelsea');
const manutd = a.team.name('Manchester Utd').slug('man_utd');
const arsenal = a.team.name('Arsenal').slug('arsenal');
const sunderland = a.team.name('Sunderland').slug('sunderland');

const epl = a.competition
  .name('English Premier League')
  .slug('english-premier-league')
  .code('epl');

const epl2020 = a.season
  .withCompetition(epl)
  .name('2019-2020')
  .slug('2019-20')
  .year(2020)
  .currentMatchRound(20)
  .seasonStart('2019-08-09T00:00:00+0200')
  .seasonEnd('2020-05-17T16:00:00+0200');

const chelseaFan = a.user.username('chelseafan').email('chelseafan@gmail.com');

const liverpoolFan = a.user
  .username('liverpoolfan')
  .email('liverpoolfan@gmail.com');

async function setupSimpleGame() {
  const game = await a.game
    .withUsers(chelseaFan, liverpoolFan)
    .withTeams(liverpool, arsenal, chelsea, manutd, sunderland)
    .withCompetitions(epl)
    .withSeasons(
      epl2020.withTeams(liverpool, arsenal, chelsea, manutd).withMatches(
        a.match
          .homeTeam(chelsea)
          .awayTeam(manutd)
          .date('2020-02-10T11:30:00Z')
          .gameRound(20)
          .withPredictions(
            a.prediction
              .user(chelseaFan)
              .homeScore(3)
              .awayScore(0)
              .joker(true),
            a.prediction
              .user(liverpoolFan)
              .homeScore(1)
              .awayScore(1),
          ),
        a.match
          .homeTeam(liverpool)
          .awayTeam(arsenal)
          .date('2020-02-14T11:30:00Z')
          .gameRound(21)
          .withPredictions(
            a.prediction
              .user(chelseaFan)
              .homeScore(1)
              .awayScore(0),
            a.prediction
              .user(liverpoolFan)
              .homeScore(2)
              .awayScore(0)
              .joker(true),
          ),
      ),
    )
    .build();
  return game;
}

describe('Game Controller', function() {
  let simpleGame: GameData;

  before(async () => {
    await memoryDb.connect();
  });

  after(async () => {
    await memoryDb.close();
  });

  describe('get game data', function() {
    let response: {
      competitions?: any;
      selectedCompetition?: any;
      selectedSeason?: any;
    };
    before(async () => {
      await memoryDb.dropDb();
      simpleGame = await setupSimpleGame();
      const gameController = new GameController(
        CompetitionRepositoryImpl.getInstance(),
        SeasonRepositoryImpl.getInstance(),
        TeamRepositoryImpl.getInstance(),
        MatchRepositoryImpl.getInstance(),
      );
      const { req, res } = setupReqRes();
      await gameController.getGameData(<any>req, <any>res);
      const firstCall = res.json.args[0];
      response = firstCall[0];
    });

    it('should have competitions', () => {
      const { competitions } = response;
      expect(competitions).to.be.an.instanceof(Array);
      expect(competitions).to.have.length(1);
    });

    it('should have a selected competition', () => {
      const { selectedCompetition } = response;
      expect(selectedCompetition).to.be.an('object');
    });

    it('should have a selected season', () => {
      const { selectedSeason } = response;
      expect(selectedSeason).to.be.an('object');
    });

    it('should have a current game round in selected season', () => {
      const { selectedSeason } = response;
      const currentGameRound = selectedSeason;
      expect(currentGameRound).to.exist;
    });

    it('should have a selected season record', () => {
      const { selectedSeason } = response;
      const { record } = selectedSeason;
      expect(record).to.be.an('object');
    });

    it('should have teams in selected season', () => {
      const { selectedSeason } = response;
      const { matches } = selectedSeason;
      expect(matches).to.be.an.instanceof(Array);
    });

    it('should have matches in selected season', () => {
      const { selectedSeason } = response;
      const { matches } = selectedSeason;
      expect(matches).to.be.an.instanceof(Array);
    });
  });
});
