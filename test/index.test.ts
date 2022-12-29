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
      it("should return a object", async () => {
        const setdef = await main.getSetDef("basis_archive_photos", "https://raw.githubusercontent.com/acdh-oeaw/AkSearchWeb/main/local/config/thumbnailfetcher/basis_archive.json");
        expect(setdef).to.be.a("object");
      });
    });
  });
  describe("fetchPages", () => {
    context("when a valid setdefinition is provided", () => {
      it("should return an array of identifiers", async () => {
        let setDef = await main.getSetDef("basis_archive_photos", "https://raw.githubusercontent.com/acdh-oeaw/AkSearchWeb/main/local/config/thumbnailfetcher/basis_archive.json");
        expect(Array.isArray(await main.fetchPages( {
              baseurl: "https://www.oeaw.ac.at/resources/api/v1/search?",
              parameters: {
                "field[]": [
                  "id",
                  "rawData",
                ],
                "filter[]": "ctrlnum:\"AT-OeAW-BA-3-27-T*\"",
                "limit": 100,
              },
              rescountpath: "resultCount",
              recsetpath: "records",
              identifierpath: "id",
            }))).to.equal(true);
      }).timeout(5000);
    });
  });
  describe("getDescendantProp", () => {
    context("when a valid object and path are passed", () => {
      it("should return the requested value", () => {
        expect(main.getDescendantProp({ test: { test2: [0, 1 , 2] }}, "test.test2[0]")).to.equal(0);
      });
    });
    context("when an unavailable path is passed", () => {
      it("should return the requested value", () => {
        expect(main.getDescendantProp({ test: {  }}, "test.test2[0]")).to.be.undefined;
      });
    });
  });
  describe("checkImage", () => {
    context("when a valid path and image ID are passed", () => {
      it("should return true", () => {
        expect(main.checkImage("./test/data", "100110003590")).to.equal(true);
      });
    });
    context("when an valid path and/or image ID are passed", () => {
      it("should return false", () => {
        expect(main.checkImage("bla", "blabla")).to.equal(false);
      });
    });
  });
  describe("getFileList", () => {
    context("when a valid path is passed", () => {
      it("should return an array of filenames", () => {
        expect(main.getFileList("./test/data")[0]).to.equal("100110003590.jpg");
      });
    });
    context("when an invalid path is passed", () => {
      it("should return an empty array", () => {
        expect(main.getFileList("./bla").length).to.equal(0);
      });
    });
  });
});
