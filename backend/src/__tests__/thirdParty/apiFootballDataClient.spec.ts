import 'mocha';
import { expect } from 'chai';
import * as mockery from 'mockery';
import sinon from 'sinon';

import { FootballApiProvider as ApiProvider } from '../../common/footballApiProvider';
import {
  FootballApiClient,
  FootballApiClientImpl,
} from '../../thirdParty/footballApi/apiClient';
import * as ApiFootballDataClient from '../../thirdParty/footballApi/apiFootballData/apiClient';
import competitions2018 from '../fixtures/requests/apiFootballData.competitions2018.json';
import matches from '../fixtures/requests/apiFootballData.epl2018Matches.json';
import teams from '../fixtures/requests/apiFootballData.epl2018Teams.json';
import eplCompetitions from '../fixtures/requests/apiFootballData.eplCompetitions.json';

describe.skip('apifootballDataClient', () => {
  describe('getCompetitions', () => {
    before(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false,
      });
      after(() => {
        mockery.disable();
      });
      it('should get real competitions by year', async () => {
        const apiClient = FootballApiClientImpl.getInstance(
          ApiProvider.API_FOOTBALL_DATA
        );
        const response = await apiClient.getCompetitions(2018);
        expect(response.data.competitions).to.be.an('array');
        expect(response.metadata).to.be.an('object');
      }).timeout(0);
      it('should get competitions by year', async () => {
        const response = {
          body: JSON.stringify(competitions2018),
          headers: {
            'x-requestcounter-reset': '60',
            'x-requests-available': '49',
          },
        };
        const apiFootballDataClient = ApiFootballDataClient.getInstance();
        const { data, metadata } =
          await apiFootballDataClient.getCompetitions(2018);
        await apiFootballDataClient.getCompetitions(2018);

        expect(data.competitions).to.be.an('array');
        expect(metadata).to.be.an('object');
      });
    });

    describe('getCompetition', () => {
      before(() => {
        mockery.enable({
          useCleanCache: true,
          warnOnReplace: false,
          warnOnUnregistered: false,
        });
      });
      after(() => {
        mockery.disable();
      });

      it('should get real competition by id', async () => {
        const apiClient = FootballApiClientImpl.getInstance(
          ApiProvider.API_FOOTBALL_DATA
        );
        const { data, metadata } = await apiClient.getCompetition(2021);
        expect(data.currentSeason).to.be.an('object');
        expect(metadata).to.be.an('object');
      }).timeout(0);

      it('should get competition by id', async () => {
        const response = {
          body: JSON.stringify(eplCompetitions),
          headers: {
            'x-requestcounter-reset': '60',
            'x-requests-available': '49',
          },
        };
        const requestStub = sinon.stub().returns(Promise.resolve(response));
        mockery.registerMock('request-promise', requestStub);

        const apiFootballDataClient: FootballApiClient =
          ApiFootballDataClient.getInstance();
        const { data, metadata } =
          await apiFootballDataClient.getCompetition(2021);
        expect(data).to.be.an('object');
        expect(metadata).to.be.an('object');
      });
    });

    xdescribe('getTeams', () => {
      before(() => {
        mockery.enable({
          useCleanCache: true,
          warnOnReplace: false,
          warnOnUnregistered: false,
        });
      });
      after(() => {
        mockery.disable();
      });
      it('should get real teams by competition', async () => {
        const apiClient = FootballApiClientImpl.getInstance(
          ApiProvider.API_FOOTBALL_DATA
        );
        const { data, metadata } = await apiClient.getTeams(2021);
        expect(data).to.be.an('object');
        expect(metadata).to.be.an('object');
        expect(data.count).to.be.a('number');
        expect(data.teams).to.be.an('array');
      }).timeout(0);

      it('should get teams by competition', async () => {
        const response = {
          body: JSON.stringify(teams),
          headers: {
            'x-requestcounter-reset': '60',
            'x-requests-available': '49',
          },
        };
        const requestStub = sinon.stub().returns(Promise.resolve(response));
        mockery.registerMock('request-promise', requestStub);

        const apiFootballDataClient: FootballApiClient =
          ApiFootballDataClient.getInstance();
        const { data, metadata } = await apiFootballDataClient.getTeams(415);

        expect(data).to.be.an('object');
        expect(metadata).to.be.an('object');
        expect(data.count).to.exist;
        expect(data.teams).to.be.exist;
      });
    });
  });

  describe('getMatches', () => {
    before(() => {
      mockery.enable({
        useCleanCache: true,
        warnOnReplace: false,
        warnOnUnregistered: false,
      });
    });
    after(() => {
      mockery.disable();
      it('should get real matches by competition', async () => {
        const apiClient = FootballApiClientImpl.getInstance(
          ApiProvider.API_FOOTBALL_DATA
        );
        const { data } = await apiClient.getMatches(['2021']);
        expect(data).to.be.an('object');
        const { matches, resultSet } = data;
        expect(resultSet.count).to.be.a('number');
        expect(matches).to.be.an('array');
      }).timeout(0);

      it('should get matches by competition', async () => {
        const response = {
          body: JSON.stringify(matches),
          headers: {
            'x-requestcounter-reset': '60',
            'x-requests-available': '49',
          },
        };
        const requestStub = sinon.stub().returns(Promise.resolve(response));
        mockery.registerMock('request-promise', requestStub);

        const apiFootballDataClient: FootballApiClient =
          ApiFootballDataClient.getInstance();
        const { data, metadata } = await apiFootballDataClient.getMatches([
          '2021',
        ]);

        expect(data).to.be.an('object');
        expect(metadata).to.be.an('object');
        expect(data.count).to.exist;
        expect(data.matches).to.exist;
      });
    });
  });
});
