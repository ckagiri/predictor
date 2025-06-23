import axios, { AxiosInstance } from 'axios';
import * as chai from 'chai';
import * as http from 'http';
import { lastValueFrom } from 'rxjs';
import sinonChai from 'sinon-chai';

import { SeasonsController } from '../../app/api/data/seasons/seasons.controller';
import { startWebServer, stopWebServer } from '../../app/server';
import { Season } from '../../db/models';
import { SeasonRepositoryImpl } from '../../db/repositories/season.repo';
import { TeamRepositoryImpl } from '../../db/repositories/team.repo';
import a, { GameData } from '../a';
import memoryDb from '../memoryDb';
import { setupReqRes } from './testUtils';

chai.use(sinonChai);
const expect = chai.expect;

let baseURL: string, seasonsAPI: AxiosInstance, server: http.Server;

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

describe.skip('Seasons API', function () {
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
    const teamRepo = TeamRepositoryImpl.getInstance();
    const seasonsController = new SeasonsController(seasonRepo, teamRepo);

    it('getSeasons will 500 if no competition id or setSlug  provided', async () => {
      const { req, res } = setupReqRes();
      await seasonsController.getSeasons(req as any, res as any);

      expect(res.json).not.to.have.been.called;
      expect(res.status).to.have.been.calledOnce;
      expect(res.status).to.have.been.calledWith(500);
    });

    it('getSeasons returns all seasons for competition id in the database', async () => {
      const { req, res } = setupReqRes();
      req.query.competition = gameData.competitions[0].slug;
      await seasonsController.getSeasons(req as any, res as any);

      expect(res.json).to.have.been.called;
      const firstCall = res.json.args[0];
      const firstArg = firstCall[0];
      const seasons = firstArg;
      expect(seasons.length).to.equal(2);
      const actualSeasons = await lastValueFrom(seasonRepo.findAll$());
      expect(seasons).to.eql(actualSeasons);
    });

    it('getSeasons returns all seasons for competition setSlug in the database', async () => {
      const { req, res } = setupReqRes();
      req.query.competition = gameData.competitions[0].slug;
      await seasonsController.getSeasons(req as any, res as any);

      expect(res.json).to.have.been.called;
      const firstCall = res.json.args[0];
      const firstArg = firstCall[0];
      const seasons = firstArg;
      expect(seasons.length).to.equal(2);
      const actualSeasons = await lastValueFrom(seasonRepo.findAll$());
      expect(seasons).to.eql(actualSeasons);
    });
  });

  describe('Season Routes', function () {
    before(async () => {
      await startWebServer();
      baseURL = `http://localhost:${String(process.env.PORT)}/api`;
      seasonsAPI = axios.create({ baseURL });
    });

    after(async () => {
      await stopWebServer();
    });

    it('should respond with JSON array', async function () {
      const seasons: Season[] = await seasonsAPI
        .get(`seasons/?competition=${gameData.competitions[0].id!}`)
        .then(res => res.data);
      expect(seasons).to.be.an.instanceof(Array);
      expect(seasons).to.have.length(2);
      expect(seasons.map(s => s.id)).to.contain(gameData.seasons[0].id);
      expect(seasons.map(s => s.id)).to.contain(gameData.seasons[1].id);
    });
  });
});
