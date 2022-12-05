import { default as sources } from "./config/sources";
import { ISetDef } from "./setdef.interface";
import {IImgsource} from "./imgsource.interface";
import {IMdsource} from "./mdsource.interface";
import axios from "axios";
import * as fs from "fs";

export class Main {
  /**
   * checks setlist against files in target folder and downloads missing ones
   * @param set
   */
  public fetch = async (set: string): Promise<string[]> => {
    const setdef: ISetDef = await this.getSetDef(set);
    const setlist = await this.fetchPages(setdef.mdsource);
    return await this.fetchImages(setdef, setlist);
  }

  /**
   * checks setlist agains files in target folder and outputs missing ones
   * @param set
   */
  public check = async (set: string): Promise<string[]> => {
    const setdef: ISetDef = await this.getSetDef(set);
    const setlist = await this.fetchPages(setdef.mdsource);
    const misslist = [];
    let i = setlist.length - 1;
    while (i > -1) {
      const identifier = this.getDescendantProp(setlist[i], setdef.mdsource.identifierpath);
      if ( !this.checkImage(setdef.target, identifier )) {
        misslist.push(identifier);
      }
      i--;
    }
    return misslist;
  }

  /**
   * fetches a queryset definition either as defined in the config files
   * @param set
   */
  private getSetDef = async (set: string): Promise<ISetDef> => {
    let setdef: ISetDef;
    if (!sources()[set]) {
      try {
        setdef = await axios.get(set, { headers: { Accept: "application/json" } });
      } catch (err) {
        console.log(`"${err.input}" was neither a valid set reference nor a valid URL!`);
        throw err;
      }
    } else { setdef = sources()[set]; }
    return setdef;
  }

  /**
   * gets setlist from solr
   * @param mdsource
   */
  private fetchPages = async (mdsource: IMdsource): Promise<Array<Record<any, any>>> => {
    const initial = await axios.get(mdsource.baseurl, { params: mdsource.parameters});
    const resultSet: Array<Record<any, any>> = [];
    let i: number = Math.floor( this.getDescendantProp(initial.data, mdsource.rescountpath) / mdsource.parameters.limit);
    while ( i > 0) {
      const page = await axios.get(mdsource.baseurl, { params: { ...mdsource.parameters, page: i } });
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
      const identifier = this.getDescendantProp(setlist[i], setdef.mdsource.identifierpath);
      if ( !this.checkImage(setdef.target, identifier )) {
        let s = setdef.imgsource.length - 1;
        while (s > -1) {
          const res = await this.checkImageSource(setdef.imgsource[s], setlist[i]);
          if (res.data) {
            fs.writeFileSync(`${setdef.target}/${identifier}.jpg`, res.data, {encoding: "base64"});
            console.log(`image for identifier ${identifier} written - ${i} identifiers left to check`);
            fetched.push(identifier);
            break;
          }
          if (s === 0) {
            console.log(`image for identifier ${identifier} not found - ${i} identifiers left to check`);
          }
          s--;
        }
      } else {
        console.log(`image for identifier ${identifier} already present - ${i} identifiers left to check`);
      }
      i--;
    }
    return fetched;
  }

  private checkImageSource = async (imgsource: IImgsource, setitem: Record<any, any>): Promise<any> => {
    const params = {};
    Object.keys(imgsource.parameters).forEach((key) => {
      params[key] = this.interpolateTemplateString(setitem, imgsource.parameters[key]);
    });
    try {
      const response = await axios.get(imgsource.baseurl, {
        params,
        headers: {
          Accept: imgsource.expectedtype,
        },
        responseType: "text",
        responseEncoding: "base64",
      });
      if (response.headers["content-type"] === imgsource.expectedtype) {
        return response;
      } else { return false; }
    } catch (err) {
      return false;
    }
  }

  /**
   * checks in a defined path if a thumbnail for a given identifier exists
   * @param path
   * @param id
   */
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
   * compile list of files in target directory, logs error if path not present, always returns an array
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
