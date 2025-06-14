import 'mocha';
import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;
import { of } from 'rxjs';

import { MatchesJob } from '../../../import/apiFootballData/matches.job';
import data from '../../fixtures/requests/apiFootballData.epl2018Matches.json';
const clientStub: any = {
  getCompetitionMatches: () => {
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
const job = MatchesJob.builder
  .withApiClient(clientStub)
  .withMatchRepo(matchRepoStub)
  .setCompetition(competitionId)
  .build();
const queueStub: any = sinon.stub();

describe('ApiFootballData:Matches Job', () => {
  describe('start', () => {
    it('should call client.getCompetitionMatches', async () => {
      const spy = sinon.spy(clientStub, 'getCompetitionMatches');

      await job.start(queueStub);

      expect(spy).to.have.been.calledOnce.and.to.have.been.calledWith(
        competitionId
      );
    });

    it('should call matchRepo.findEachBySeasonAndTeamsAndUpsert$', async () => {
      const spy = sinon.spy(
        matchRepoStub,
        'findEachBySeasonAndTeamsAndUpsert$'
      );

      await job.start(queueStub);

      expect(spy).to.have.been.calledOnce.and.to.have.been.calledWith(
        sinon.match.array
      );
    });
  });
});
