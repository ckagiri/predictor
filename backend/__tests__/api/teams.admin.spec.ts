import axios, { AxiosInstance } from 'axios';
import * as chai from 'chai';
import * as http from 'http';
import { lastValueFrom } from 'rxjs';
import sinonChai from 'sinon-chai';

import { TeamsController } from '../../app/api/data/teams/teams.controller';
import startServer from '../../app/server';
import { Team } from '../../db/models';
import { SeasonRepositoryImpl } from '../../db/repositories/season.repo';
import { TeamRepositoryImpl } from '../../db/repositories/team.repo';
import a, { GameData } from '../a';
import memoryDb from '../memoryDb';
import { setupReqRes } from './testUtils';

chai.use(sinonChai);
const expect = chai.expect;

let baseURL: string, server: http.Server, teamsAPI: AxiosInstance;

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

const liverpool = a.team.setName('Liverpool').setSlug('liverpool');
const chelsea = a.team.setName('Chelsea').setSlug('chelsea');
const sunderland = a.team.setName('Sunderland').setSlug('sunderland');

async function setupGameData() {
  const gameData = await a.game
    .withTeams(liverpool, chelsea, sunderland)
    .withCompetitions(epl)
    .withSeasons(epl2020.withTeams(liverpool, chelsea))
    .build();
  return gameData;
}

describe.skip('Teams API', function () {
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

  describe('Teams Controller', function () {
    const teamRepo = TeamRepositoryImpl.getInstance();
    const seasonRepo = SeasonRepositoryImpl.getInstance();
    const teamsController = new TeamsController(teamRepo, seasonRepo);

    it('getTeams returns all teams in the database', async () => {
      const { req, res } = setupReqRes();
      await teamsController.getTeams(req as any, res as any);

      expect(res.json).to.have.been.called;
      const firstCall = res.json.args[0];
      const firstArg = firstCall[0];
      const teams = firstArg;
      expect(teams.length).to.be.greaterThan(0);
      const actualTeams = await lastValueFrom(teamRepo.findAll$());
      expect(teams).to.eql(actualTeams);
    });
  });

  describe('Team Routes', function () {
    before(async () => {
      server = await startServer();
      baseURL = `http://localhost:${process.env.PORT}/api`;
      teamsAPI = axios.create({ baseURL });
    });

    after(() => {
      server.close();
    });

    it('should respond with JSON array for all teams', async function () {
      const teams: Team[] = await teamsAPI.get('teams').then(res => res.data);
      expect(teams).to.be.an.instanceof(Array);
      expect(teams).to.have.length(3);
    });

    it('should respond with JSON array for season teams', async function () {
      const teams: Team[] = await teamsAPI
        .get(`teams/?seasonId=${gameData.seasons[0].id}`)
        .then(res => res.data);
      expect(teams).to.be.an.instanceof(Array);
      expect(teams).to.have.length(2);
      expect(teams.map(c => c.slug)).to.contain('liverpool');
      expect(teams.map(c => c.slug)).to.contain('chelsea');
    });
  });
});
