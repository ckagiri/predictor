import * as http from 'http';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiHttp = require('chai-http');
import axios, { AxiosInstance } from 'axios';
import { setupReqRes } from './testUtils';
import { MatchesController } from '../../app/api/matches/matches.controller';
import { Match } from '../../db/models';
import memoryDb from '../memoryDb';
import a, { GameData } from '../a';
import { MatchRepositoryImpl } from '../../db/repositories/match.repo';
import startServer from '../../app/server';

chai.use(sinonChai);
chai.use(chaiHttp);
const expect = chai.expect;

let server: http.Server, matchsAPI: AxiosInstance, baseURL: string;

const epl = a.competition
  .setName('English Premier League')
  .setSlug('english-premier-league')
  .setCode('epl');

const epl2020 = a.season
  .withCompetition(epl)
  .setName('2019-2020')
  .setSlug('2019-20')
  .setYear(2020)
  .withGameRounds(20)
  .setSeasonStart('2019-08-09T00:00:00+0200')
  .setSeasonEnd('2020-05-17T16:00:00+0200');

const liverpool = a.team.setName('Liverpool').setSlug('liverpool');
const chelsea = a.team.setName('Chelsea').setSlug('chelsea');
const manutd = a.team.setName('Manchester Utd').setSlug('man_utd');
const arsenal = a.team.setName('Arsenal').setSlug('arsenal');

async function setupGameData() {
  const gameData = await a.game
    .withTeams(liverpool, arsenal, chelsea, manutd)
    .withCompetitions(epl)
    .withSeasons(
      epl2020.withTeams(liverpool, arsenal, chelsea, manutd).withMatches(
        a.match
          .withHomeTeam(chelsea)
          .withAwayTeam(manutd)
          .setDate('2020-02-10T11:30:00Z')
          .withGameRound(20),
        a.match
          .withHomeTeam(liverpool)
          .withAwayTeam(arsenal)
          .setDate('2020-02-14T11:30:00Z')
          .withGameRound(21),
      ),
    )
    .build();
  return gameData;
}

describe('Matches API', function () {
  let gameData: GameData;

  before(async () => {
    await memoryDb.connect();
  });

  beforeEach(async () => {
    await memoryDb.dropDb();
    gameData = await setupGameData();
  });

  after(async () => {
    await memoryDb.close();
  });

  describe('Matches Controller', function () {
    const matchRepo = MatchRepositoryImpl.getInstance();
    const matchesController = new MatchesController(matchRepo);

    it('getMatches will 500 if no seasonId provided', async () => {
      const { req, res } = setupReqRes();
      await matchesController.getMatches(<any>req, <any>res);

      expect(res.json).not.to.have.been.called;
      expect(res.status).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(500);
    });

    it('getMatches returns all season-matches in the database', async () => {
      const { req, res } = setupReqRes();
      req.query.seasonId = gameData.seasons[0].id;
      await matchesController.getMatches(<any>req, <any>res);

      expect(res.json).to.have.been.called;
      const firstCall = res.json.args[0];
      const matches = firstCall[0];
      expect(matches.length).to.equal(2);
      const actualMatches = await matchRepo.findAll$().toPromise();
      expect(matches).to.eql(actualMatches);
    });
  });

  describe('Match Routes', function () {
    before(async () => {
      server = await startServer();
      baseURL = `http://localhost:${process.env.PORT}/api`;
      matchsAPI = axios.create({ baseURL });
    });

    after(() => {
      server.close();
    });

    it('should respond with JSON array', async function () {
      const matches: Match[] = await matchsAPI
        .get(`matches/?seasonId=${gameData.seasons[0].id}`)
        .then(res => res.data);
      expect(matches).to.be.an('array');
      expect(matches).to.have.length(2);
      expect(matches.map(m => m.id)).to.contain(gameData.matches[0].id);
      expect(matches.map(m => m.id)).to.contain(gameData.matches[1].id);
    });
  });
});
