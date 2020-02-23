import 'mocha';
import sinon from 'sinon';
import { expect } from 'chai';
import { of } from 'rxjs';
import { AfdMatchConverter } from '../../db/converters/apiFootballData/match.converter';

describe('Match Converter', () => {
  describe('Afd MatchConverter', () => {
    const season = {
      _id: '4edd40c86762e0fb12000001',
    };
    const seasonRepoStub: any = {
      findByExternalId$: () => {
        return of(season);
      },
    };
    const homeTeam = {
      id: '4edd40c86762e0fb12000001',
      name: 'Arsenal',
      slug: 'arsenal',
      crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Arsenal_FC.svg',
    };
    const awayTeam = {
      id: '4edd40c86762e0fb12000002',
      name: 'Chelsea',
      slug: 'chelsea',
      crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Chelsea.svg',
    };
    const teamRepoStub: any = {
      findByName$: sinon.stub(),
    };
    teamRepoStub.findByName$
      .withArgs(sinon.match('Arsenal'))
      .returns(of(homeTeam));
    teamRepoStub.findByName$
      .withArgs(sinon.match('Chelsea'))
      .returns(of(awayTeam));
    const converter = new AfdMatchConverter(seasonRepoStub, teamRepoStub);
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
        name: 'Arsenal',
      },
      awayTeam: {
        id: 338,
        name: 'Chelsea',
      },
    };
    it('should convert correctly', done => {
      const conversion = converter.from(match);
      conversion.subscribe(f => {
        expect(f.homeTeam!.name).to.equal(homeTeam.name);
        expect(f.awayTeam!.name).to.equal(awayTeam.name);
        expect(f.matchRound).to.equal(match.matchday);
        expect(f.slug).to.equal(`${homeTeam.slug}-v-${awayTeam.slug}`);
        expect(f.externalReference).to.deep.equal({
          API_FOOTBALL_DATA: { id: 233371 },
        });

        done();
      });
    });
  });
});
