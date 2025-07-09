import 'mocha';
import * as chai from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
chai.use(sinonChai);
const expect = chai.expect;
import { of } from 'rxjs';

import { CompetitionJob } from '../../../app/tasks/import/apiFootballData/competition.job';
import { MatchesJob } from '../../../app/tasks/import/apiFootballData/matches.job';
import { TeamsJob } from '../../../app/tasks/import/apiFootballData/teams.job';
import teams from '../../fixtures/requests/apiFootballData.epl2018Teams.json';
import competition from '../../fixtures/requests/apiFootballData.eplCompetitions.json';

const queueStub: any = {
  addJob: (n: any) => {
    /**/
  },
};
const clientStub: any = {
  getCompetition: () => {
    return Promise.resolve({
      data: competition,
      metadata: {},
    });
  },
  getTeams: () => {
    return Promise.resolve({
      data: teams,
      metadata: {},
    });
  },
};
const seasonRepoStub: any = {
  findByExternalIdAndUpdate$: () => {
    return of(competition);
  },
};
const teamRepoStub: any = {
  findByNameAndUpdate$: () => {
    return of(teams.teams);
  },
};

const matchRepoStub: any = {};

const competitionId = 2021;
const job = CompetitionJob.builder
  .withApiClient(clientStub)
  .withSeasonRepo(seasonRepoStub)
  .withTeamRepo(teamRepoStub)
  .withMatchRepo(matchRepoStub)
  .setCompetition(competitionId)
  .build();

describe('ApiFootballData:Competition Job', () => {
  describe('start', () => {
    it('should call client.getCompetition', async () => {
      const spy = sinon.spy(clientStub, 'getCompetition');
      await job.start(queueStub);

      expect(spy).to.have.been.calledOnce.and.to.have.been.calledWith(
        competitionId
      );
    });

    it('should call seasonRepo.findByExternalIdAndUpdate$', async () => {
      const spy = sinon.spy(seasonRepoStub, 'findByExternalIdAndUpdate$');

      await job.start(queueStub);

      expect(spy).to.have.been.calledOnce.and.to.have.been.calledWith(
        sinon.match.object
      );
    });

    it('should add matchesJob to queue', async () => {
      const spy = sinon.spy(queueStub, 'addJob');

      await job.start(queueStub);

      expect(spy).to.have.been.called.and.to.have.been.calledWith(
        sinon.match.instanceOf(MatchesJob)
      );

      queueStub.addJob.restore();
    });

    it.skip('should add teamsJob to queue', async () => {
      const spy = sinon.spy(queueStub, 'addJob');

      await job.start(queueStub);

      expect(spy).to.have.been.called.and.to.have.been.calledWith(
        sinon.match.instanceOf(TeamsJob)
      );

      queueStub.addJob.restore();
    });
  });
});
