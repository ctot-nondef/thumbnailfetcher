import { default as sources } from "./config/sources";
import { ISetDef } from "./setdef.interface";
import axios from "axios";
import * as fs from "fs";

export class Main {
  /**
   * checks setlist against files in target folder and downloads missing ones
   * @param set
   */
  public fetch = async (set: string) => {
    if (!sources()[set]) {
      console.error(`Set "${set}" is not defined.`);
    }
    console.log(`Processing set "${set}"`);
    const setdef: ISetDef = sources()[set];
    const setlist = await this.fetchPages(setdef);
    const createdlist = this.fetchImages(setdef, setlist);
    console.log(createdlist);
  }

  /**
   * gets setlist from solr
   * @param setdef
   */
  private fetchPages = async (setdef: ISetDef): Promise<Array<Record<any, any>>> => {
    const initial = await axios.get(setdef.mdsource.baseurl, { params: setdef.mdsource.parameters});
    const resultSet: Array<Record<any, any>> = [];
    let i: number = Math.floor( this.getDescendantProp(initial.data, setdef.mdsource.rescountpath) / setdef.mdsource.parameters.limit);
    while ( i > 0) {
      const page = await axios.get(setdef.mdsource.baseurl, { params: { ...setdef.mdsource.parameters, page: i } });
      console.log(`${i} pages left.`);
      resultSet.push(...page.data.records);
      i--;
    }
    return(resultSet);
  }

  private fetchImages = async (setdef: ISetDef, setlist: Array<Record<any, any>>): Promise<string[]> => {
    const fetched = [];
    let i = setlist.length - 1;
    while (i > -1) {
      const params = { };
      const identifier = this.getDescendantProp(setlist[i], setdef.mdsource.identifierpath);
      Object.keys(setdef.imgsource.parameters).forEach((key) => {
        params[key] = this.interpolateTemplateString(setlist[i], setdef.imgsource.parameters[key]);
      });
      // console.log(params);
      if ( !this.checkImage(setdef.target, identifier )) {
        const response = await axios.get(setdef.imgsource.baseurl, {
          params,
          responseType: "text",
          responseEncoding: "base64",
        });
        // TODO: make this dynamic for other image types
        if (response.headers["content-type"] === "image/jpeg") {
          fs.writeFileSync(`${setdef.target}/${identifier}.jpg`, response.data, {encoding: "base64"});
          console.log(`image ${identifier}.jpg written - ${i} images left`);
          fetched.push(identifier);
        } else {
          console.log(`image ${identifier}.jpg not found - ${i} images left`);
        }
      } else {
        console.log(`image ${identifier}.jpg already present - ${i} images left`);
      }
      i--;
    }
    return fetched;
  }

  private checkImage = (path: string, id: string): boolean => {
    try {
      if (fs.existsSync(`${path}/${id}.jpg`) || fs.existsSync(`${path}/${id}.jpeg`)) {
        return true;
      }
    } catch (err) {
      return false;
    }
  }

  /**
   * compile list of files in target directory
   * @param path
   */
  private getFileList = (path: string): string[] => {
    const filelist: string[] = [];
    try {
      filelist.push(...fs.readdirSync(path));
    } catch (err) {
      console.log(err);
    }
    return filelist;
  }

  private getDescendantProp = (obj: Record<any, any>, desc: string): any => {
    const arr = desc.split(".");
    // tslint:disable-next-line:no-conditional-assignment no-empty
    while (arr.length && (obj = obj[arr.shift()])) {}
    return obj;
  }

  private interpolateTemplateString = (params: Record<any, any>, s: string): string => {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${s}\`;`)(...vals);
  }

}

export const instance = new Main();
