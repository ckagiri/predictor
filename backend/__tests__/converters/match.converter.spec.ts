import 'mocha';
import sinon from 'sinon';
import { expect } from 'chai';
import { of } from 'rxjs';
import { AfdMatchConverter } from '../../db/converters/apiFootballData/match.converter';

describe('Match Converter', () => {
  describe('Afd MatchConverter', () => {
    const season = {
      id: '4edd40c86762e0fb12000001',
    };
    const round = {
      id: 'some-round-id',
    }
    const seasonRepoStub: any = {
      findByExternalId$: () => {
        return of(season);
      },
    };
    const homeTeam = {
      id: '4edd40c86762e0fb12000001',
      name: 'Arsenal',
      slug: 'arsenal',
      tla: 'ARS',
      crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Arsenal_FC.svg',
    };
    const awayTeam = {
      id: '4edd40c86762e0fb12000002',
      name: 'Chelsea',
      tla: 'CHE',
      slug: 'chelsea',
      crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Chelsea.svg',
    };
    const teamRepoStub: any = {
      findByName$: sinon.stub(),
    };
    const gameRoundRepoStub: any = {
      findOne$: sinon.stub(),
    };
    teamRepoStub.findByName$
      .withArgs(sinon.match('Arsenal'))
      .returns(of(homeTeam));
    teamRepoStub.findByName$
      .withArgs(sinon.match('Chelsea'))
      .returns(of(awayTeam));
    gameRoundRepoStub.findOne$
      .withArgs(sinon.match({ position: 35 }))
      .returns(of({ id: round.id }));
    const converter = new AfdMatchConverter(seasonRepoStub, teamRepoStub, gameRoundRepoStub);
    const match = {
      id: 233371,
      season: {
        id: 151,
      },
      utcDate: '2019-04-20T14:00:00Z',
      status: 'SCHEDULED',
      matchday: 35,
      score: {
        fullTime: {
          homeTeam: null,
          awayTeam: null,
        },
      },
      homeTeam: {
        id: 563,
        shortName: 'Arsenal',
      },
      awayTeam: {
        id: 338,
        shortName: 'Chelsea',
      },
    };
    it('should convert correctly', done => {
      const conversion = converter.from(match);
      conversion.subscribe(m => {
        expect(m.homeTeam!.name).to.equal(homeTeam.name);
        expect(m.awayTeam!.name).to.equal(awayTeam.name);
        expect(m.matchday).to.equal(match.matchday);
        expect(m.slug).to.equal((`${homeTeam.tla}-${awayTeam.tla}`).toLowerCase());
        expect(m.externalReference).to.deep.equal({
          API_FOOTBALL_DATA: { id: 233371 },
        });

        done();
      });
    });
  });
});
