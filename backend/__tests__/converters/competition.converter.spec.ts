import 'mocha';
import { expect } from 'chai';
import { Observable } from 'rxjs';

import { CompetitionConverter } from '../../db/converters/competition.converter';
import { LigiCompetitionConverter } from '../../db/converters/ligi/competition.converter';

describe('Competition Converter', () => {
  describe('Ligi CompetitionConverterImpl', () => {
    const converter: CompetitionConverter = new LigiCompetitionConverter();
    const competition = {
      name: 'English Premier League',
      slug: 'english_premier_league',
      code: 'epl',
    };

    it('should return an observable when converting', () => {
      const conversion = converter.from(competition);
      expect(conversion instanceof Observable).to.equal(true);
    });

    it('should convert correctly', done => {
      const conversion = converter.from(competition);
      conversion.subscribe(l => {
        expect(l.name).to.equal(competition.name);
        expect(l.slug).to.equal(competition.slug);
        expect(l.code).to.equal(competition.code);

        done();
      });
    });
  });
});
