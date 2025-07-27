import 'mocha';
import { expect } from 'chai';
import { Observable } from 'rxjs';

import { CompetitionConverter } from '../../db/converters/competition.converter';
import { LigiCompetitionConverter } from '../../db/converters/ligi/competition.converter';

describe('Competition Converter', () => {
  describe('Ligi CompetitionConverterImpl', () => {
    const converter: CompetitionConverter = new LigiCompetitionConverter();
    const competition = {
      code: 'epl',
      name: 'English Premier League',
      slug: 'english_premier_league',
    };

    it('should return an observable when converting', () => {
      const conversion = converter.from(competition);
      expect(conversion instanceof Observable).to.equal(true);
    });

    it('should convert correctly', done => {
      const conversion = converter.from(competition);
      conversion.subscribe(c => {
        expect(c.name).to.equal(competition.name);
        expect(c.slug).to.equal(competition.slug);
        expect(c.code).to.equal(competition.code);

        done();
      });
    });
  });
});
