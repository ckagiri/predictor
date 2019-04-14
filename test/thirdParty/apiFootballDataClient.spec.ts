import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import * as mockery from 'mockery';

import { FootballApiClient, IFootballApiClient } from '../../src/thirdParty/footballApi/apiClient';
import { FootballApiProvider as ApiProvider } from '../../src/common/footballApiProvider';

describe.only('apifootballDataClient', () => {
  describe('getCompetitions', () => {
    before(() => {
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true
      })
    });
    after(() => {
      mockery.disable();
    });
    it('should get real competitions by year', async () => {
      const apiClient = FootballApiClient.getInstance(ApiProvider.API_FOOTBALL_DATA);
      const response = await apiClient.getCompetitions(2018);
      expect(response.data.competitions).to.be.an('array');
      expect(response.metadata).to.be.an('object');
    }).timeout(0);

    it('should get competitions by year', async () => {
      const competitions = require('../fixtures/requests/apiFootballData.competitions2018');
      const response = {
        body: JSON.stringify(competitions),
        headers: {
          'x-requests-available': '49',
          'x-requestcounter-reset': '60'
        }
      }
      const requestStub = sinon.stub().returns(Promise.resolve(response));
      mockery.registerMock('request-promise', requestStub);
      const ApiFootballDataClient = require('../../src/thirdParty/footballApi/apiFootballData/apiClient');
      const apiFootballDataClient = ApiFootballDataClient.getInstance() as IFootballApiClient;
      const { data, metadata } = await apiFootballDataClient.getCompetitions(2018);

      expect(data.competitions).to.be.an('array');
      expect(metadata).to.be.an('object');
    })
  })

  describe('getCompetition', () => {
    before(() => {
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true
      })
    });
    after(() => {
      mockery.disable();
    });

    it('should get real competition by id', async () => {
      const apiClient = FootballApiClient.getInstance(ApiProvider.API_FOOTBALL_DATA);
      const { data, metadata } = await apiClient.getCompetition(2021);
      expect(data.currentSeason).to.be.an('object');
      expect(metadata).to.be.an('object');
    }).timeout(0);

    it('should get competition by id', async () => {
      const competition = require('../fixtures/requests/apiFootballData.epl2018');
      const response = {
        body: JSON.stringify(competition),
        headers: {
          'x-requests-available': '49',
          'x-requestcounter-reset': '60'
        }
      }
      const requestStub = sinon.stub().returns(Promise.resolve(response));
      mockery.registerMock('request-promise', requestStub);

      const ApiFootballDataClient = require('../../src/thirdParty/footballApi/apiFootballData/apiClient');
      const apiFootballDataClient = ApiFootballDataClient.getInstance() as IFootballApiClient;
      const { data, metadata } = await apiFootballDataClient.getCompetition(2021);
      expect(data).to.be.an('object');
      expect(metadata).to.be.an('object');
    })
  });

  describe('getTeams', () => {
    before(() => {
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true
      })
    });
    after(() => {
      mockery.disable();
    });

    it('should get real teams by competition', async () => {
      const apiClient = FootballApiClient.getInstance(ApiProvider.API_FOOTBALL_DATA);
      const { data, metadata } = await apiClient.getTeams(2021);
      expect(data).to.be.an('object');
      expect(metadata).to.be.an('object');
      expect(data.count).to.be.a('number');
      expect(data.teams).to.be.an('array');
    }).timeout(0);

    it('should get teams by competition', async () => {
      const teams = require('../fixtures/requests/apiFootballData.epl2018Teams');
      const response = {
        body: JSON.stringify(teams),
        headers: {
          'x-requests-available': '49',
          'x-requestcounter-reset': '60'
        }
      }
      const requestStub = sinon.stub().returns(Promise.resolve(response));
      mockery.registerMock('request-promise', requestStub);

      const ApiFootballDataClient = require('../../src/thirdParty/footballApi/apiFootballData/apiClient');
      const apiFootballDataClient: IFootballApiClient = ApiFootballDataClient.getInstance();
      const { data, metadata } = await apiFootballDataClient.getTeams(415);

      expect(data).to.be.an('object');
      expect(metadata).to.be.an('object');
      expect(data.count).to.exist;
      expect(data.teams).to.be.exist;
    })
  })

  describe('getFixtures', () => {
    before(() => {
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true
      })
    });
    after(() => {
      mockery.disable();
    });

    it('should get real fixtures by competition', async () => {
      const apiClient = FootballApiClient.getInstance(ApiProvider.API_FOOTBALL_DATA);
      const { data, metadata } = await apiClient.getFixtures(2021);
      expect(data).to.be.an('object');
      expect(metadata).to.be.an('object');
      expect(data.count).to.be.a('number');
      expect(data.matches).to.be.an('array');
    }).timeout(0);

    it('should get fixtures by competition', async () => {
      const fixtures = require('../fixtures/requests/apiFootballData.epl2018Fixtures');
      const response = {
        body: JSON.stringify(fixtures),
        headers: {
          'x-requests-available': '49',
          'x-requestcounter-reset': '60'
        }
      }
      const requestStub = sinon.stub().returns(Promise.resolve(response));
      mockery.registerMock('request-promise', requestStub);

      const ApiFootballDataClient = require('../../src/thirdParty/footballApi/apiFootballData/apiClient');
      const apiFootballDataClient: IFootballApiClient = ApiFootballDataClient.getInstance();
      const { data, metadata } = await apiFootballDataClient.getFixtures(2021);

      expect(data).to.be.an('object');
      expect(metadata).to.be.an('object');
      expect(data.count).to.exist;
      expect(data.matches).to.exist;
    })
  })
})