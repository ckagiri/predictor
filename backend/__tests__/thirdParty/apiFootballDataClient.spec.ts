import 'mocha';
import { expect } from 'chai';
import sinon from 'sinon';
import * as mockery from 'mockery';

import {
  FootballApiClientImpl,
  FootballApiClient,
} from '../../thirdParty/footballApi/apiClient';
import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';

describe('apifootballDataClient', () => {
  describe('getCompetitions', () => {
    before(() => {
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true,
      });
    });
    after(() => {
      mockery.disable();
    });
    it('should get real competitions by year', async () => {
      const apiClient = FootballApiClientImpl.getInstance(
        ApiProvider.API_FOOTBALL_DATA,
      );
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
          'x-requestcounter-reset': '60',
        },
      };
      const requestStub = sinon.stub().returns(Promise.resolve(response));
      mockery.registerMock('request-promise', requestStub);
      const ApiFootballDataClient = require('../../thirdParty/footballApi/apiFootballData/apiClient');
      const apiFootballDataClient = ApiFootballDataClient.getInstance() as FootballApiClient;
      const { data, metadata } = await apiFootballDataClient.getCompetitions(
        2018,
      );

      expect(data.competitions).to.be.an('array');
      expect(metadata).to.be.an('object');
    });
  });

  describe('getCompetition', () => {
    before(() => {
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true,
      });
    });
    after(() => {
      mockery.disable();
    });

    it('should get real competition by id', async () => {
      const apiClient = FootballApiClientImpl.getInstance(
        ApiProvider.API_FOOTBALL_DATA,
      );
      const { data, metadata } = await apiClient.getCompetition(2021);
      expect(data.currentSeason).to.be.an('object');
      expect(metadata).to.be.an('object');
    }).timeout(0);

    it('should get competition by id', async () => {
      const competition = require('../fixtures/requests/apiFootballData.eplCompetitions');
      const response = {
        body: JSON.stringify(competition),
        headers: {
          'x-requests-available': '49',
          'x-requestcounter-reset': '60',
        },
      };
      const requestStub = sinon.stub().returns(Promise.resolve(response));
      mockery.registerMock('request-promise', requestStub);

      const ApiFootballDataClient = require('../../thirdParty/footballApi/apiFootballData/apiClient');
      const apiFootballDataClient: FootballApiClient = ApiFootballDataClient.getInstance();
      const { data, metadata } = await apiFootballDataClient.getCompetition(
        2021,
      );
      expect(data).to.be.an('object');
      expect(metadata).to.be.an('object');
    });
  });

  describe('getTeams', () => {
    before(() => {
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true,
      });
    });
    after(() => {
      mockery.disable();
    });

    it('should get real teams by competition', async () => {
      const apiClient = FootballApiClientImpl.getInstance(
        ApiProvider.API_FOOTBALL_DATA,
      );
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
          'x-requestcounter-reset': '60',
        },
      };
      const requestStub = sinon.stub().returns(Promise.resolve(response));
      mockery.registerMock('request-promise', requestStub);

      const ApiFootballDataClient = require('../../thirdParty/footballApi/apiFootballData/apiClient');
      const apiFootballDataClient: FootballApiClient = ApiFootballDataClient.getInstance();
      const { data, metadata } = await apiFootballDataClient.getTeams(415);

      expect(data).to.be.an('object');
      expect(metadata).to.be.an('object');
      expect(data.count).to.exist;
      expect(data.teams).to.be.exist;
    });
  });

  describe('getMatches', () => {
    before(() => {
      mockery.enable({
        warnOnReplace: false,
        warnOnUnregistered: false,
        useCleanCache: true,
      });
    });
    after(() => {
      mockery.disable();
    });

    it('should get real matches by competition', async () => {
      const apiClient = FootballApiClientImpl.getInstance(
        ApiProvider.API_FOOTBALL_DATA,
      );
      const { data } = await apiClient.getMatches(['2021']);
      expect(data).to.be.an('object');
      const { resultSet, matches } = data;
      expect(resultSet.count).to.be.a('number');
      expect(matches).to.be.an('array');
    }).timeout(0);

    it('should get matches by competition', async () => {
      const matches = require('../fixtures/requests/apiFootballData.epl2018Matches');
      const response = {
        body: JSON.stringify(matches),
        headers: {
          'x-requests-available': '49',
          'x-requestcounter-reset': '60',
        },
      };
      const requestStub = sinon.stub().returns(Promise.resolve(response));
      mockery.registerMock('request-promise', requestStub);

      const ApiFootballDataClient = require('../../thirdParty/footballApi/apiFootballData/apiClient');
      const apiFootballDataClient: FootballApiClient = ApiFootballDataClient.getInstance();
      const { data, metadata } = await apiFootballDataClient.getMatches(['2021']);

      expect(data).to.be.an('object');
      expect(metadata).to.be.an('object');
      expect(data.count).to.exist;
      expect(data.matches).to.exist;
    });
  });
});
