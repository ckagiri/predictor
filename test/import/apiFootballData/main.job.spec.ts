import 'mocha';
import sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from "sinon-chai";
chai.use(sinonChai);
const expect = chai.expect;
import { of } from 'rxjs';

import { MainJob } from '../../../src/import/apiFootballData/main.job';
import { CompetitionJob } from '../../../src/import/apiFootballData/competition.job';

const competitions = require('../../fixtures/requests/apiFootballData.competitions2018');
const queueStub: any = {
  addJob: (job: any) => {/**/}
}
const clientStub: any = {
  getCompetitions: () => {
    return Promise.resolve({
      data: competitions,
      metadata: {}
    })
  }
}
const seasonRepoStub: any = sinon.stub();
const teamRepoStub: any = sinon.stub();
const fixtureRepoStub: any = sinon.stub();

describe('ApiFootballData:Main Job', () => {
  describe('start', () => {
    it('should call client.getCompetitions', async () => {
      const spy = sinon.spy(clientStub, 'getCompetitions');

      const mainJob = new MainJob(clientStub, seasonRepoStub, teamRepoStub, fixtureRepoStub)
      await mainJob.start(queueStub)

      expect(spy).to.be.called;
      clientStub.getCompetitions.restore();
    })

    it('should call client.getCompetitions with a given year', async () => {
      const spy = sinon.spy(clientStub, 'getCompetitions');

      const mainJob = new MainJob(clientStub, seasonRepoStub, teamRepoStub, fixtureRepoStub)
      await mainJob.start(queueStub)

      expect(spy).to.have.been.calledWith(2017);
    })

    describe('with given year', () => {

      it('should add CompetitionJobs to queue', async () => {
        const spy = sinon.spy(queueStub, 'addJob');

        const mainJob = new MainJob(clientStub, seasonRepoStub, teamRepoStub, fixtureRepoStub)
        await mainJob.start(queueStub)

        expect(spy).to.have.been.called;
        expect(spy).to.have.been.calledWith(sinon.match.instanceOf(CompetitionJob))
      })
    })
  })
})