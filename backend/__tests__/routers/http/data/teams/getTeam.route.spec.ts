import axios, { AxiosInstance } from 'axios';
import { expect } from 'chai';
import http from 'http';
import { AddressInfo } from 'net';

import startServer from '../../../../../app/server';
import a from '../../../../a';
import memoryDb from '../../../../memoryDb';

let axiosAPIClient: AxiosInstance, baseURL: string, server: http.Server;

const epl = a.competition
  .setName('English Premier League')
  .setSlug('premier-league')
  .setCode('epl');

const epl25_26 = a.season
  .withCompetition(epl)
  .setName('2025-2026')
  .setSlug('2025-26')
  .setYear(2025)
  .setCurrentMatchday(1)
  .setSeasonStart('2025-08-09T00:00:00+0200')
  .setSeasonEnd('2026-05-17T16:00:00+0200');

const liverpool = a.team.setName('Liverpool').setSlug('liverpool');
const chelsea = a.team.setName('Chelsea').setSlug('chelsea');
const sunderland = a.team.setName('Sunderland').setSlug('sunderland');

async function setupGameData() {
  await a.game
    .withCompetitions(epl)
    .withTeams(liverpool, chelsea, sunderland)
    .withSeasons(epl25_26.withTeams(liverpool, chelsea))
    .build();
}

describe.only('GET Teams Route', () => {
  before(async () => {
    await memoryDb.connect();
    server = await startServer({ port: '8000' });
    const serverAddress = server.address();
    baseURL = `http://localhost:${String((serverAddress as AddressInfo).port)}/api`;
    const axiosConfig = {
      baseURL,
      validateStatus: () => true,
    };
    axiosAPIClient = axios.create(axiosConfig);
  });

  beforeEach(async () => {
    await setupGameData();
  });

  afterEach(async () => {
    await memoryDb.dropDb();
  });

  after(async () => {
    await memoryDb.close();
    server.close();
  });

  describe('GET api/teams', () => {
    it('When asked for teams, Then should retrieve and receive 200 response', async () => {
      const { data, status } = await axiosAPIClient.get('/teams');

      expect({
        data,
        status,
      }).to.containSubset({
        data: [
          {
            id: liverpool.id,
            name: liverpool.name,
            slug: liverpool.slug,
          },
          {
            id: chelsea.id,
            name: chelsea.name,
            slug: chelsea.slug,
          },
          {
            id: sunderland.id,
            name: sunderland.name,
            slug: sunderland.slug,
          },
        ],
        status: 200,
      });
    });
  });
});
