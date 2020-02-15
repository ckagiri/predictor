import "chai";
import { expect } from "chai";
import { Observable } from "rxjs";

import { SeasonConverter as LigiSeasonConverter } from "../../db/converters/ligi/season.converter";
import { SeasonConverter as AfdSeasonConverter } from "../../db/converters/apiFootballData/season.converter";

describe("Season Converter", () => {
  describe.skip("Ligi SeasonConverter", () => {
    const converter = LigiSeasonConverter.getInstance();
    const season = {
      name: "2017-2018",
      slug: "17-18",
      year: 2017
    };
    it("should convert correctly", done => {
      const conversion = converter.from(season);
      conversion.subscribe(s => {
        expect(s.name).to.equal(season.name);
        expect(s.slug).to.equal(season.slug);

        done();
      });
    });
  });

  describe("Afd SeasonConverter", () => {
    const converter = new AfdSeasonConverter();
    const season = {
      id: 2021,
      name: "Premier League",
      code: "PL",
      currentSeason: {
        id: 151,
        startDate: "2018-08-10",
        endDate: "2019-05-12",
        currentMatchday: 34,
        winner: null
      }
    };
    it("should convert correctly", done => {
      const conversion = converter.from(season);
      conversion.subscribe(s => {
        expect(s.currentMatchRound).to.equal(
          season.currentSeason.currentMatchday
        );
        expect(s.externalReference).to.deep.equal({
          API_FOOTBALL_DATA: { id: 151 }
        });
        done();
      });
    });
  });
});
