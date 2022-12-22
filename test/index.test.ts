/* tslint:disable:no-unused-expression */
import { expect } from "chai";
import { instance as main } from "../src/index";

describe("main", () => {
  describe("getSetDef", () => {
    context("when a fake path or URL is entered", () => {
      it("should return undefined", async () => {
        expect(await main.getSetDef("fake", "feke")).to.be.undefined;
      });
    });
    context("when a valid URL but invalid setname is entered", () => {
      it("should return undefined", async () => {
        expect(await main.getSetDef("fakesetname", "https://raw.githubusercontent.com/acdh-oeaw/AkSearchWeb/main/local/config/thumbnailfetcher/basis_archive.json")).to.be.undefined;
      });
    });
    context("when a valid URL and setname is entered", () => {
      it("should return undefined", async () => {
        const setdef = await main.getSetDef("basis_archive_photos", "https://raw.githubusercontent.com/acdh-oeaw/AkSearchWeb/main/local/config/thumbnailfetcher/basis_archive.json");
        expect(setdef).to.be.a("object");
      });
    });
  });
  describe("getDescendantProp", () => {
    context("when a valid object and path are passed", () => {
      it("should return the requested value", async () => {
        expect(await main.getDescendantProp({ test: { test2: [0, 1 , 2] }}, "test.test2[0]")).to.equal(0);
      });
    });
    context("when an unavailable path is passed", () => {
      it("should return the requested value", async () => {
        expect(await main.getDescendantProp({ test: {  }}, "test.test2[0]")).to.be.undefined;
      });
    });
  });
});
