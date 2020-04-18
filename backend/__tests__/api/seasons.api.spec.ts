import * as http from 'http';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiHttp = require('chai-http');
import axios, { AxiosInstance } from 'axios';
import { setupReqRes } from './testUtils';
import { SeasonsController } from '../../app/api/seasons/seasons.controller';
import { Season } from '../../db/models';
import memoryDb from '../memoryDb';
import a, { GameData } from '../a';
import { SeasonRepositoryImpl } from '../../db/repositories/season.repo';
import startServer from '../../app/server';

chai.use(sinonChai);
chai.use(chaiHttp);
const expect = chai.expect;

let server: http.Server, seasonsAPI: AxiosInstance, baseURL: string;

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

const epl2019 = a.season
  .withCompetition(epl)
  .name('2018-2019')
  .slug('2018-19')
  .year(2019)
  .currentMatchRound(38)
  .seasonStart('2018-08-09T00:00:00+0200')
  .seasonEnd('2019-05-17T16:00:00+0200');

async function setupGameData() {
  const gameData = await a.game
    .withCompetitions(epl)
    .withSeasons(epl2020, epl2019)
    .build();
  return gameData;
}

describe('Seasons API', function () {
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

  describe('Seasons Controller', function () {
    const seasonRepo = SeasonRepositoryImpl.getInstance();
    const seasonsController = new SeasonsController(seasonRepo);

    it('getSeasons will 500 if no competition id or slug  provided', async () => {
      const { req, res } = setupReqRes();
      await seasonsController.getSeasons(<any>req, <any>res);

      expect(res.json).not.to.have.been.called;
      expect(res.status).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(500);
    });

    it('getSeasons returns all seasons for competition id in the database', async () => {
      const { req, res } = setupReqRes();
      req.query.competition = gameData.competitions[0].id;
      await seasonsController.getSeasons(<any>req, <any>res);

      expect(res.json).to.have.been.called;
      const firstCall = res.json.args[0];
      const firstArg = firstCall[0];
      const seasons = firstArg;
      expect(seasons.length).to.equal(2);
      const actualSeasons = await seasonRepo.findAll$().toPromise();
      expect(seasons).to.eql(actualSeasons);
    });

    it('getSeasons returns all seasons for competition slug in the database', async () => {
      const { req, res } = setupReqRes();
      req.query.competition = gameData.competitions[0].slug;
      await seasonsController.getSeasons(<any>req, <any>res);

      expect(res.json).to.have.been.called;
      const firstCall = res.json.args[0];
      const firstArg = firstCall[0];
      const seasons = firstArg;
      expect(seasons.length).to.equal(2);
      const actualSeasons = await seasonRepo.findAll$().toPromise();
      expect(seasons).to.eql(actualSeasons);
    });
  });

  describe('Season Routes', function () {
    before(async () => {
      server = await startServer();
      baseURL = `http://localhost:${process.env.PORT}/api`;
      seasonsAPI = axios.create({ baseURL });
    });

    after(() => {
      server.close();
    });

    it('should respond with JSON array', async function () {
      const seasons: Season[] = await seasonsAPI
        .get(`seasons/?competition=${gameData.competitions[0].id}`)
        .then(res => res.data);
      expect(seasons).to.be.an.instanceof(Array);
      expect(seasons).to.have.length(2);
      expect(seasons.map(s => s.id)).to.contain(gameData.seasons[0].id);
      expect(seasons.map(s => s.id)).to.contain(gameData.seasons[1].id);
    });
  });
});
