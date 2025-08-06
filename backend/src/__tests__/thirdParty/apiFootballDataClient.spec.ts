import 'mocha';
import { expect } from 'chai';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import { FootballApiClientImpl } from '../../thirdParty/footballApi/apiClient';

const TIMEOUT = 60 * 1000;
const PL = { code: 'PL', id: 2021 };
const PL_MATCH_IDS = [537785, 537786];

describe('apifootballDataClient', () => {
  const apiClient = FootballApiClientImpl.getInstance(
    ApiProvider.API_FOOTBALL_DATA
  );
  it('should get competition by id', async () => {
    const { data, metadata } = await apiClient.getCompetition(PL.id);
    expect(data.currentSeason).to.be.an('object');
    expect(metadata).to.be.an('object');
  }).timeout(TIMEOUT);

  it.only('should get teams by competition', async () => {
    const { data, metadata } = await apiClient.getTeams(PL.id);
    expect(data).to.be.an('object');
    expect(metadata).to.be.an('object');
    expect(data.count).to.be.a('number');
    expect(data.teams).to.be.an('array');
  }).timeout(TIMEOUT);

  it('should get matches by competition', async () => {
    const { data, metadata } = await apiClient.getMatches(PL_MATCH_IDS);
    expect(data).to.be.an('object');
    expect(metadata).to.be.an('object');
    expect(data.count).to.exist;
    expect(data.matches).to.exist;
  }).timeout(TIMEOUT);
});
