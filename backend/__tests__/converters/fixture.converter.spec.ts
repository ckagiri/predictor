import "mocha";
import sinon from "sinon";
import { expect } from "chai";
import { of } from "rxjs";
import { FixtureConverter as AfdFixtureConverter } from "../../db/converters/apiFootballData/fixture.converter";

describe("Fixture Converter", () => {
  describe("Afd FixtureConverter", () => {
    const season = {
      _id: "4edd40c86762e0fb12000001"
    };
    const seasonRepoStub: any = {
      findByExternalId$: () => {
        return of(season);
      }
    };
    const homeTeam = {
      id: "4edd40c86762e0fb12000001",
      name: "Arsenal",
      slug: "arsenal",
      crestUrl: "http://upload.wikimedia.org/wikipedia/de/d/da/Arsenal_FC.svg"
    };
    const awayTeam = {
      id: "4edd40c86762e0fb12000002",
      name: "Chelsea",
      slug: "chelsea",
      crestUrl: "http://upload.wikimedia.org/wikipedia/de/d/da/Chelsea.svg"
    };
    const teamRepoStub: any = {
      findByName$: sinon.stub()
    };
    teamRepoStub.findByName$
      .withArgs(sinon.match("Arsenal"))
      .returns(of(homeTeam));
    teamRepoStub.findByName$
      .withArgs(sinon.match("Chelsea"))
      .returns(of(awayTeam));
    const converter = new AfdFixtureConverter(seasonRepoStub, teamRepoStub);
    const fixture = {
      id: 233371,
      season: {
        id: 151
      },
      utcDate: "2019-04-20T14:00:00Z",
      status: "SCHEDULED",
      matchday: 35,
      score: {
        fullTime: {
          homeTeam: null,
          awayTeam: null
        }
      },
      homeTeam: {
        id: 563,
        name: "Arsenal"
      },
      awayTeam: {
        id: 338,
        name: "Chelsea"
      }
    };
    it("should convert correctly", done => {
      const conversion = converter.from(fixture);
      conversion.subscribe(f => {
        expect(f.homeTeam!.name).to.equal(homeTeam.name);
        expect(f.awayTeam!.name).to.equal(awayTeam.name);
        expect(f.matchRound).to.equal(fixture.matchday);
        expect(f.slug).to.equal(`${homeTeam.slug}-v-${awayTeam.slug}`);
        expect(f.externalReference).to.deep.equal({
          API_FOOTBALL_DATA: { id: 233371 }
        });

        done();
      });
    });
  });
});
