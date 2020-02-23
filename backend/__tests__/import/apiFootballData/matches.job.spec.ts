import 'mocha';
import sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;
import { of } from 'rxjs';

import { MatchesJob } from '../../../import/apiFootballData/matches.job';

import data from '../../fixtures/requests/apiFootballData.epl2018Matches.json';
const clientStub: any = {
  getMatches: () => {
    return Promise.resolve({
      data,
    });
  },
};
const matchRepoStub: any = {
  findEachBySeasonAndTeamsAndUpsert$: () => {
    return of(data.matches);
  },
};
const competitionId = 2021;
const jobBuilder = MatchesJob.Builder;
const job = jobBuilder
  .setApiClient(clientStub)
  .setMatchRepo(matchRepoStub)
  .withCompetition(competitionId)
  .build();
const queueStub: any = sinon.stub();

describe('ApiFootballData:Matches Job', () => {
  describe('start', () => {
    it('should call client.getMatches', async () => {
      const spy = sinon.spy(clientStub, 'getMatches');

      await job.start(queueStub);

      expect(spy).to.have.been.calledOnce.and.to.have.been.calledWith(
        competitionId,
      );
    });

    it('should call matchRepo.findEachBySeasonAndTeamsAndUpsert$', async () => {
      const spy = sinon.spy(
        matchRepoStub,
        'findEachBySeasonAndTeamsAndUpsert$',
      );

      await job.start(queueStub);

      expect(spy).to.have.been.calledOnce.and.to.have.been.calledWith(
        sinon.match.array,
      );
    });
  });
});
