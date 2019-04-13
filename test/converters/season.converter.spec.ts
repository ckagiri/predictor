import "chai";
import { expect } from "chai";
import { Observable } from "rxjs";

import { SeasonConverter as LigiSeasonConverter } from "../../src/db/converters/ligi/season.converter";
import { SeasonConverter as AfdSeasonConverter } from "../../src/db/converters/apiFootballData/season.converter";

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
      id: 445,
      caption: "Premier League 2017/18",
      league: "PL",
      year: "2017",
      currentMatchday: 32,
      numberOfMatchdays: 38,
      numberOfTeams: 20,
      numberOfGames: 380,
      lastUpdated: "2018-03-21T08:10:10Z"
    };
    it("should convert correctly", done => {
      const conversion = converter.from(season);
      conversion.subscribe(s => {
        expect(s.name).to.equal(season.caption);
        expect(s.externalReference).to.deep.equal({
          API_FOOTBALL_DATA: { id: 445 }
        });
        done();
      });
    });
  });
});
