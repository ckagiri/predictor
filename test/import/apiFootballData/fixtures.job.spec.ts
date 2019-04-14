import 'mocha';
import sinon from 'sinon';
import * as chai from 'chai';
import sinonChai from "sinon-chai";
chai.use(sinonChai);
const expect = chai.expect;
import { of } from 'rxjs';

import { FixturesJob } from '../../../src/import/apiFootballData/fixtures.job';

const fixtures = require('../../fixtures/requests/apiFootballData.epl2018Fixtures');
const clientStub: any = {
  getFixtures: () => {
    return Promise.resolve({
      data: fixtures
    })
  }
}
const fixtureRepoStub: any = {
  findEachBySeasonAndTeamsAndUpsert$: () => {
    return of(fixtures.fixtures)
  }
}
const competitionId = 445;
const jobBuilder = FixturesJob.Builder;
const job = jobBuilder
  .setApiClient(clientStub)
  .setFixtureRepo(fixtureRepoStub)
  .withCompetition(competitionId)
  .build()
const queueStub: any = sinon.stub();

describe('ApiFootballData:Fixtures Job', () => {
  describe('start', () => {
    it('should call client.getFixtures', async () => {
      const spy = sinon.spy(clientStub, 'getFixtures');

      await job.start(queueStub)

      expect(spy).to.have.been.calledOnce
        .and.to.have.been.calledWith(competitionId);
    })

    it('should call fixtureRepo.findEachBySeasonAndTeamsAndUpsert$', async () => {
      const spy = sinon.spy(fixtureRepoStub, 'findEachBySeasonAndTeamsAndUpsert$');

      await job.start(queueStub)

      expect(spy).to.have.been.calledOnce
        .and.to.have.been.calledWith(sinon.match.array);
    })
  })
})