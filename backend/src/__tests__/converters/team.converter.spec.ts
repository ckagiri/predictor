import 'mocha';
import { expect } from 'chai';
import { of } from 'rxjs';
import sinon from 'sinon';

import { AfdTeamConverter } from '../../db/converters/apiFootballData/team.converter';
import { LigiTeamConverter } from '../../db/converters/ligi/team.converter';

describe('Team Converter', () => {
  describe('Ligi TeamConverterImpl', () => {
    const converter = new LigiTeamConverter();
    const team = {
      aliases: ['Man Utd'],
      code: 'MUN',
      crestUrl:
        'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg',
      name: 'Manchester United FC',
      shortName: 'Man United',
      slug: 'man_united',
    };
    it('should convert correctly', done => {
      const conversion = converter.from(team);
      conversion.subscribe(t => {
        expect(t.name).to.equal(team.name);
        expect(t.slug).to.equal(team.slug);

        done();
      });
    });
  });

  describe('Afd TeamConverterImpl', () => {
    const dbTeam = {
      id: '4edd40c86762e0fb12000001',
      name: 'Arsenal',
      slug: 'arsenal',
      tla: 'ARS',
    };

    const teamRepoStub: any = {
      findByName$: sinon
        .stub()
        .withArgs(sinon.match('Arsenal'))
        .returns(of(dbTeam)),
    };
    const converter = new AfdTeamConverter();
    converter.setTeamRepo(teamRepoStub);
    const apiTeam = {
      crestUrl: 'http://upload.wikimedia.org/wikipedia/de/d/da/Arsenal_FC.svg',
      id: 66,
      name: 'Arsenal FC',
      shortName: 'Arsenal',
      venue: 'Emirates Stadium',
    };
    it('should convert correctly', done => {
      const conversion = converter.from(apiTeam);
      conversion.subscribe(t => {
        expect(t.name).to.equal(dbTeam.name);
        expect(t.crestUrl).to.equal(apiTeam.crestUrl);
        expect(t.externalReference).to.deep.equal({
          API_FOOTBALL_DATA: { id: 66 },
        });

        done();
      });
    });
  });
});
