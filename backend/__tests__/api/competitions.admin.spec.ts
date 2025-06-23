import axios, { AxiosInstance } from 'axios';
import * as chai from 'chai';
import * as http from 'http';
import { lastValueFrom } from 'rxjs';
import sinonChai from 'sinon-chai';

import { CompetitionsController } from '../../app/api/data/competitions/competitions.controller';
import { startWebServer, stopWebServer } from '../../app/server';
import { Competition } from '../../db/models';
import { CompetitionRepositoryImpl } from '../../db/repositories/competition.repo';
import a, { GameData } from '../a';
import memoryDb from '../memoryDb';
import { setupReqRes } from './testUtils';

chai.use(sinonChai);
const expect = chai.expect;

let baseURL: string, competitionsAPI: AxiosInstance, server: http.Server;

const epl = a.competition
  .setName('English Premier League')
  .setSlug('english-premier-league')
  .setCode('epl');

const spl = a.competition
  .setName('Spanish La Liga')
  .setSlug('la-liga')
  .setCode('spl');

async function setupGameData() {
  const gameData = await a.game.withCompetitions(epl, spl).build();
  return gameData;
}

describe.skip('Competitions API', function () {
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
      await competitionsController.getCompetitions(req as any, res as any);

      expect(res.json).to.have.been.calledOnce;
      const firstCall = res.json.args[0];
      const firstArg = firstCall[0];
      const competitions = firstArg;
      expect(competitions.length).to.be.greaterThan(0);
      const actualCompetitions = await lastValueFrom(
        competitionRepo.findAll$()
      );
      expect(competitions).to.eql(actualCompetitions);
    });
  });

  describe('Competition Routes', function () {
    before(async () => {
      await startWebServer();
      baseURL = `http://localhost:${String(process.env.PORT)}/api`;
      competitionsAPI = axios.create({ baseURL });
    });

    after(async () => {
      await stopWebServer();
    });

    it('should respond with JSON array', async function () {
      const res = await competitionsAPI.get('competitions');
      const competitions: Competition[] = res.data;
      expect(competitions).to.be.an.instanceof(Array);
      expect(competitions).to.have.length(2);
      expect(competitions.map(c => c.id)).to.contain(
        gameData.competitions[0].id
      );
      expect(competitions.map(c => c.id)).to.contain(
        gameData.competitions[1].id
      );

      //expect(res).to.have.header('content-range', 'Competitions 0-1/2');
    });
  });
});
