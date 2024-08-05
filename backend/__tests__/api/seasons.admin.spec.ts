import * as http from 'http';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
import chaiHttp = require('chai-http');
import axios, { AxiosInstance } from 'axios';
import { setupReqRes } from './testUtils';
import { SeasonsController } from '../../app/api/admin/seasons/seasons.controller';
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
  .setName('English Premier League')
  .setSlug('english-premier-league')
  .setCode('epl');

const epl2020 = a.season
  .withCompetition(epl)
  .setName('2019-2020')
  .setSlug('2019-20')
  .setYear(2020)
  .setCurrentMatchday(20)
  .setSeasonStart('2019-08-09T00:00:00+0200')
  .setSeasonEnd('2020-05-17T16:00:00+0200');

const epl2019 = a.season
  .withCompetition(epl)
  .setName('2018-2019')
  .setSlug('2018-19')
  .setYear(2019)
  .setCurrentMatchday(38)
  .setSeasonStart('2018-08-09T00:00:00+0200')
  .setSeasonEnd('2019-05-17T16:00:00+0200');

async function setupGameData() {
  const gameData = await a.game
    .withCompetitions(epl)
    .withSeasons(epl2020, epl2019)
    .build();
  return gameData;
}

describe.only('Seasons API', function () {
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

    it('getSeasons will 500 if no competition id or setSlug  provided', async () => {
      const { req, res } = setupReqRes();
      await seasonsController.getSeasons(<any>req, <any>res);

      expect(res.json).not.to.have.been.called;
      expect(res.status).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(500);
    });

    it('getSeasons returns all seasons for competition id in the database', async () => {
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

    it('getSeasons returns all seasons for competition setSlug in the database', async () => {
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
