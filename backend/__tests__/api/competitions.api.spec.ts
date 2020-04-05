import * as http from 'http';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiHttp = require('chai-http');
import axios, { AxiosInstance } from 'axios';
import { setupReqRes } from './testUtils';
import { CompetitionsController } from '../../app/api/competitions/competitions.controller';
import { Competition } from '../../db/models';
import memoryDb from '../memoryDb';
import a, { GameData } from '../a';
import { CompetitionRepositoryImpl } from '../../db/repositories/competition.repo';
import startServer from '../../app/server';

chai.use(chaiHttp);
chai.use(sinonChai);
const expect = chai.expect;

let server: http.Server, competitionsAPI: AxiosInstance, baseURL: string;

const epl = a.competition
  .name('English Premier League')
  .slug('english-premier-league')
  .code('epl');

const slg = a.competition
  .name('Spanish La Liga')
  .slug('spanish_la_liga')
  .code('slg');

async function setupGameData() {
  const gameData = await a.game.withCompetitions(epl, slg).build();
  return gameData;
}

describe('Competitions API', function () {
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

  describe('Competitions Controller', function () {
    const competitionRepo = CompetitionRepositoryImpl.getInstance();
    const competitionsController = new CompetitionsController(competitionRepo);

    it('getCompetitions returns all competitions in the database', async () => {
      const { req, res } = setupReqRes();
      await competitionsController.getCompetitions(<any>req, <any>res);

      expect(res.json).to.have.been.called;
      const firstCall = res.json.args[0];
      const firstArg = firstCall[0];
      const competitions = firstArg;
      expect(competitions.length).to.be.greaterThan(0);
      const actualCompetitions = await competitionRepo.findAll$().toPromise();
      expect(competitions).to.eql(actualCompetitions);
    });
  });

  describe('Competition Routes', function () {
    before(async () => {
      server = await startServer();
      baseURL = `http://localhost:${process.env.PORT}/api`;
      competitionsAPI = axios.create({ baseURL });
    });

    after(() => {
      server.close();
    });

    it.only('should respond with JSON array', async function () {
      const res = await competitionsAPI
        .get('competitions');
      const competitions: Competition[] = res.data;
      expect(competitions).to.be.an.instanceof(Array);
      expect(competitions).to.have.length(2);
      expect(competitions.map(c => c.id)).to.contain(
        gameData.competitions[0].id,
      );
      expect(competitions.map(c => c.id)).to.contain(
        gameData.competitions[1].id,
      );

      expect(res).to.have.header('content-range', 'Competitions 0-1/2');
    });
  });
});
