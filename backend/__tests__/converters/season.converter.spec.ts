import { expect } from 'chai';
import { of } from 'rxjs';

import { LigiSeasonConverter } from '../../db/converters/ligi/season.converter';
import { AfdSeasonConverter } from '../../db/converters/apiFootballData/season.converter';

describe('Season Converter', () => {
  describe('Ligi SeasonConverter', () => {
    const competition = {
      id: '4gdd40g86762f0fb12000001',
      name: 'English Premier League',
      slug: 'english_premier_league',
      code: 'epl',
    };
    const competitionRepoStub: any = {
      findById$: () => {
        return of(competition);
      },
    };

    const converter = new LigiSeasonConverter(competitionRepoStub);
    const season = {
      name: '2017-2018',
      slug: '17-18',
      year: 2017,
    };
    it('should convert correctly', done => {
      const conversion = converter.from(season);
      conversion.subscribe(s => {
        expect(s.name).to.equal(season.name);
        expect(s.slug).to.equal(season.slug);
        expect(s.competition).to.deep.equal({
          id: competition.id,
          name: competition.name,
          slug: competition.slug,
        });
        done();
      });
    });
  });

  describe('Afd SeasonConverter', () => {
    const converter = new AfdSeasonConverter();
    const season = {
      id: 2021,
      name: 'Premier League',
      code: 'PL',
      currentSeason: {
        id: 151,
        startDate: '2018-08-10',
        endDate: '2019-05-12',
        currentMatchday: 34,
        winner: null,
      },
    };
    it('should convert correctly', done => {
      const conversion = converter.from(season);
      conversion.subscribe(s => {
        expect(s.currentMatchday).to.equal(
          season.currentSeason.currentMatchday,
        );
        expect(s.externalReference).to.deep.equal({
          API_FOOTBALL_DATA: { id: 151 },
        });
        done();
      });
    });
  });
});
