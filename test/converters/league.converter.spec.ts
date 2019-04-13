import "mocha";
import { expect } from "chai";
import { Observable } from "rxjs";

import { ILeagueConverter } from "../../src/db/converters/league.converter";
import { LeagueConverter as LigiLeagueConverter } from "../../src/db/converters/ligi/league.converter";

describe("League Converter", () => {
  describe("Ligi LeagueConverter", () => {
    const converter: ILeagueConverter = new LigiLeagueConverter();
    const league = {
      name: "English Premier League",
      slug: "english_premier_league",
      code: "epl"
    };

    it("should return an observable when converting", () => {
      const conversion = converter.from(league);
      expect(conversion instanceof Observable).to.equal(true);
    });

    it("should convert correctly", done => {
      const conversion = converter.from(league);
      conversion.subscribe(l => {
        expect(l.name).to.equal(league.name);
        expect(l.slug).to.equal(league.slug);
        expect(l.code).to.equal(league.code);

        done();
      });
    });
  });
});
