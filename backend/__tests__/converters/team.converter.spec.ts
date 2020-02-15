import "mocha";
import { expect } from "chai";

import { TeamConverter as LigiTeamConverter } from "../../db/converters/ligi/team.converter";
import { TeamConverter as AfdTeamConverter } from "../../db/converters/apiFootballData/team.converter";

describe("Team Converter", () => {
  describe("Ligi TeamConverter", () => {
    const converter = new LigiTeamConverter();
    const team = {
      name: "Manchester United FC",
      shortName: "Man United",
      code: "MUN",
      slug: "man_united",
      crestUrl:
        "http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg",
      aliases: ["ManU", "ManUtd"]
    };
    it("should convert correctly", done => {
      const conversion = converter.from(team);
      conversion.subscribe(t => {
        expect(t.name).to.equal(team.name);
        expect(t.slug).to.equal(team.slug);

        done();
      });
    });
  });

  describe("Afd TeamConverter", () => {
    const converter = new AfdTeamConverter();
    const team = {
      id: 66,
      name: "Manchester United FC",
      shortName: "ManU",
      squadMarketValue: null,
      crestUrl:
        "http://upload.wikimedia.org/wikipedia/de/d/da/Manchester_United_FC.svg"
    };
    it("should convert correctly", done => {
      const conversion = converter.from(team);
      conversion.subscribe(t => {
        expect(t.name).to.equal(team.name);
        expect(t.crestUrl).to.equal(team.crestUrl);
        expect(t.externalReference).to.deep.equal({
          API_FOOTBALL_DATA: { id: 66 }
        });

        done();
      });
    });
  });
});
