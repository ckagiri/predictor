import 'mocha';
import { expect } from 'chai';

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
    const converter = new AfdTeamConverter();
    const team = {
      crestUrl:
        'http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg',
      id: 66,
      name: 'Manchester United FC',
      shortName: 'Man United',
      squadMarketValue: null,
    };
    it('should convert correctly', done => {
      const conversion = converter.from(team);
      conversion.subscribe(t => {
        expect(t.name).to.equal(team.shortName);
        expect(t.crestUrl).to.equal(team.crestUrl);
        expect(t.externalReference).to.deep.equal({
          API_FOOTBALL_DATA: { id: 66 },
        });

        done();
      });
    });
  });
});
