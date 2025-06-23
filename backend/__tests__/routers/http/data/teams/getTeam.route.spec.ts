import { expect } from 'chai';

import a from '../../../../a';
import memoryDb from '../../../../memoryDb';
import testSetup from '../../../../testSetup';

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

describe('GET Teams Route', () => {
  before(async () => {
    await memoryDb.connect();
    await testSetup.start({ startAPI: true, webPort: '8000' });
  });

  beforeEach(async () => {
    await setupGameData();
  });

  afterEach(async () => {
    await memoryDb.dropDb();
  });

  after(async () => {
    await memoryDb.close();
    await testSetup.tearDown();
  });

  describe('GET api/teams', () => {
    it('When asked for teams, Then should retrieve and receive 200 response', async () => {
      const { data, status } = await testSetup.getHttpClient().get('/teams');

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
