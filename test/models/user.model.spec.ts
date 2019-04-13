import "mocha";
import { expect } from "chai";
import * as bcrypt from "bcrypt-nodejs";

import { User, IUser } from "../../src/db/models/user.model";

describe("Users", () => {
  describe("schema", () => {
    describe("an empty user", () => {
      const u = new User();
      it("should have 1 mandatory property", done => {
        u.validate(err => {
          expect(Object.keys(err.errors)).to.have.lengthOf(1);
          done();
        });
      });

      it("should require an email", done => {
        u.validate(err => {
          expect(err.errors.email).to.exist;
          done();
        });
      });
    });

    describe("a minimal user", () => {
      const user: IUser = {
        username: "Alpha",
        email: "test@example.com",
        phone: "+254123456"
      };

      const u = new User(user);

      it("should have 0 errors", done => {
        u.validate(err => {
          expect(err).to.eql(null);
          done();
        });
      });

      it("should not be admin", done => {
        u.validate(err => {
          expect(err).to.eql(null);
          expect(u).to.have.property("isAdmin", false);
          done();
        });
      });

      it("should have an id", done => {
        expect(u).to.have.property("id");
        expect(u.id).not.to.be.empty;
        expect(u.id).to.be.a("string");
        done();
      });

      it("should not be admin", done => {
        u.validate(err => {
          expect(err).to.eql(null);
          expect(u).to.have.property("isAdmin", false);
          done();
        });
      });
    });

    describe("an admin user", () => {
      const user: IUser = {
        username: "Alpha",
        email: "admin@example.com",
        isAdmin: true,
        phone: "+254123456"
      };

      const u = new User(user);

      it("should be admin", done => {
        u.validate(err => {
          expect(err).to.eql(null);
          expect(u).to.have.property("isAdmin", true);
          done();
        });
      });
    });

    describe("comparePassword", () => {
      const salt = bcrypt.genSaltSync(10);

      const user: IUser = {
        username: "Alpha",
        email: "user@example.com",
        phone: "+254123456"
      };

      it("should fail on comparePassword with empty pwd", done => {
        const u = new User(user);

        u.validate(err => {
          expect(err).to.eql(null);
          expect(u).to.have.property("local");
        });

        u.comparePassword("test", (err: any, isMatch: any) => {
          expect(isMatch).to.be.undefined;
          expect(err).to.eql("Incorrect arguments");
          done();
        });
      });

      it("should fail on incorrectly salted stored pwd", done => {
        user.local = { password: "test" };
        const u = new User(user);

        u.validate(err => {
          expect(err).to.eql(null);
          expect(u).to.have.property("local");
        });

        u.comparePassword("test", (err: any, isMatch: any) => {
          expect(isMatch).to.be.undefined;
          expect(err).to.eql("Not a valid BCrypt hash.");
          done();
        });
      });

      it("should fail on comparePassword with wrong pwd", done => {
        user.local = { password: bcrypt.hashSync("test", salt) };
        const u = new User(user);

        u.validate(err => {
          expect(err).to.eql(null);
          expect(u).to.have.property("local");
          expect(u.local).to.have.property("password");
        });

        u.comparePassword("test2", (err: any, isMatch: any) => {
          expect(isMatch).to.be.false;
          expect(err).to.be.null;
          done();
        });
      });

      it("should succeed on comparePassword with correct pwd", done => {
        user.local = { password: bcrypt.hashSync("test", salt) };
        const u = new User(user);

        u.validate(err => {
          expect(err).to.eql(null);
          expect(u).to.have.property("local");
          expect(u.local).to.have.property("password");
        });

        u.comparePassword("test", (err: any, isMatch: any) => {
          expect(isMatch).to.be.true;
          expect(err).to.be.null;
          done();
        });
      });
    });
  });
});
