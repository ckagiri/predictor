import 'mocha';
import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;

import { CompetitionJob } from '../../../import/apiFootballData/competition.job';
import { MainJob } from '../../../import/apiFootballData/main.job';
import data from '../../fixtures/requests/apiFootballData.competitions2018.json';

const queueStub: any = {
  addJob: (job: any) => {
    /**/
  },
};
const clientStub: any = {
  getCompetitions: () => {
    return Promise.resolve({
      data,
      metadata: {},
    });
  },
};
const seasonRepoStub: any = sinon.stub();
const teamRepoStub: any = sinon.stub();
const matchRepoStub: any = sinon.stub();

describe('ApiFootballData:Main Job', () => {
  describe('start', () => {
    it('should call client.getCompetitions', async () => {
      const spy = sinon.spy(clientStub, 'getCompetitions');

      const mainJob = new MainJob(
        clientStub,
        seasonRepoStub,
        teamRepoStub,
        matchRepoStub
      );
      await mainJob.start(queueStub);

      expect(spy).to.be.called;
      clientStub.getCompetitions.restore();
    });

    it('should call client.getCompetitions with a given year', async () => {
      const spy = sinon.spy(clientStub, 'getCompetitions');

      const mainJob = new MainJob(
        clientStub,
        seasonRepoStub,
        teamRepoStub,
        matchRepoStub
      );
      await mainJob.start(queueStub);

      expect(spy).to.have.been.calledWith(2021);
    });

    describe('with given year', () => {
      it('should add CompetitionJobs to queue', async () => {
        const spy = sinon.spy(queueStub, 'addJob');

        const mainJob = new MainJob(
          clientStub,
          seasonRepoStub,
          teamRepoStub,
          matchRepoStub
        );
        await mainJob.start(queueStub);

        expect(spy).to.have.been.called;
        expect(spy).to.have.been.calledWith(
          sinon.match.instanceOf(CompetitionJob)
        );
      });
    });
  });
});
