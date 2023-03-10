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
      it("should return am array with one setdef", async () => {
        const setdef = await main.getSetDef("basis_archive_photos", "https://raw.githubusercontent.com/acdh-oeaw/AkSearchWeb/main/local/config/thumbnailfetcher/basis_archive.json");
        expect(setdef).to.be.a("array");
        expect(setdef.length).to.equal(1);
      });
    });
    context("when a valid URL but no setname is entered", () => {
      it("should return an array of setdefinitions", async () => {
        const setdef = await main.getSetDef(null, "https://raw.githubusercontent.com/acdh-oeaw/AkSearchWeb/main/local/config/thumbnailfetcher/basis_archive.json");
        expect(setdef).to.be.a("array");
        expect(setdef.length).to.equal(2);
      });
    });
    context("when a valid path and setname is entered", () => {
      it("should return a object", async () => {
        const setdef = await main.getSetDef("test_set", "./test/data/config.json");
        expect(setdef).to.be.a("array");
      });
    });
  });
  describe("fetchPages", () => {
    context("when a valid setdefinition is provided", () => {
      it("should return an array of identifiers", async () => {
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
      }).timeout(10000);
    });
  });
  describe("fetchImages", () => {
    context("when a valid setdefinition is provided", () => {
      it("should return an array of identifiers", async () => {
        expect(Array.isArray(await main.fetchImages({
          mdsource: {
            baseurl: "https://www.oeaw.ac.at/resources/api/v1/search?",
            parameters: {
              "field[]": [
                "id",
                "rawData",
              ],
              "filter[]": "ctrlnum:\"AT-OeAW-BA-3-27-P-*\"",
              "limit": 100,
            },
            rescountpath: "resultCount",
            recsetpath: "records",
            identifierpath: "id",
          },
          imgsource: [
            {
              baseurl: "https://opacbasis.acdh.oeaw.ac.at/wwwopac.ashx?",
              parameters: {
                command: "getcontent",
                server: "images",
                imageformat: "jpg",
                width: 500,
                height: 500,
                value: "${id}.tif",
              },
              expectedtype: "image/jpeg",
            },
          ],
          target: "./test/data/",
        }, [{id: "100110003590"}, { id: "100110003591"}, { id: "AT-OeAW-BA-3-27-P-2713"}]))).to.equal(true);
      }).timeout(10000);
    });
  });
  describe("check", () => {
    context("when a valid setdefinition and setname are provided", () => {
      it("should return an array of identifiers", async () => {
        const misslist = await main.check("test_set", "./test/data/config.json");
        expect(misslist.length).to.equal(1);
      }).timeout(10000);
    });
  });
  describe("fetch", () => {
    context("when a valid setdefinition and setname are provided", () => {
      it("should return an array of identifiers", async () => {
        const misslist = await main.fetch("test_set", "./test/data/config.json");
        expect(misslist.length).to.equal(1);
      }).timeout(10000);
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
