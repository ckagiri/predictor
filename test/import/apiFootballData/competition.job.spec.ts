import "mocha";
import sinon from "sinon";
import * as chai from "chai";
import sinonChai from "sinon-chai";
chai.use(sinonChai);
const expect = chai.expect;
import { of } from "rxjs";

import { CompetitionJob } from "../../../src/import/apiFootballData/competition.job";
import { FixturesJob } from "../../../src/import/apiFootballData/fixtures.job";
import { TeamsJob } from "../../../src/import/apiFootballData/teams.job";

import competition from "../../../src/db/tasks/seedData/seed-epl18.json";
import teams from "../../fixtures/requests/apiFootballData.epl2018Teams.json";

const queueStub: any = {
  addJob: (n: any) => {
    /**/
  }
};
const clientStub: any = {
  getCompetition: () => {
    return Promise.resolve({
      data: competition,
      metadata: {}
    });
  },
  getTeams: () => {
    return Promise.resolve({
      data: teams,
      metadata: {}
    });
  }
};
const seasonRepoStub: any = {
  findByExternalIdAndUpdate$: () => {
    return of(competition);
  }
};
const teamRepoStub: any = {
  findByNameAndUpdate$: () => {
    return of(teams.teams);
  }
};
const competitionId = 445;
const jobBuilder = CompetitionJob.Builder;
const job = jobBuilder
  .setApiClient(clientStub)
  .setSeasonRepo(seasonRepoStub)
  .setTeamRepo(teamRepoStub)
  .withCompetition(competitionId)
  .build();

describe("ApiFootballData:Competition Job", () => {
  describe("start", () => {
    it("should call client.getCompetition", async () => {
      const spy = sinon.spy(clientStub, "getCompetition");
      await job.start(queueStub);

      expect(spy).to.have.been.calledOnce.and.to.have.been.calledWith(
        competitionId
      );
    });

    it("should call seasonRepo.findByExternalIdAndUpdate$", async () => {
      const spy = sinon.spy(seasonRepoStub, "findByExternalIdAndUpdate$");

      await job.start(queueStub);

      expect(spy).to.have.been.calledOnce.and.to.have.been.calledWith(
        sinon.match.object
      );
    });

    it("should add fixturesJob to queue", async () => {
      const spy = sinon.spy(queueStub, "addJob");

      await job.start(queueStub);

      expect(spy).to.have.been.called.and.to.have.been.calledWith(
        sinon.match.instanceOf(FixturesJob)
      );

      queueStub.addJob.restore();
    });

    it("should add teamsJob to queue", async () => {
      const spy = sinon.spy(queueStub, "addJob");

      await job.start(queueStub);

      expect(spy).to.have.been.called.and.to.have.been.calledWith(
        sinon.match.instanceOf(TeamsJob)
      );

      queueStub.addJob.restore();
    });
  });
});
