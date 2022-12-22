import { ISetDef } from "./setdef.interface";
import {IImgsource} from "./imgsource.interface";
import {IMdsource} from "./mdsource.interface";
import axios from "axios";
import * as fs from "fs";

export class Main {
  /**
   * checks setlist against files in target folder and downloads missing ones
   * @param set
   * @param configpath
   */
  public fetch = async (set: string, configpath: string): Promise<string[]> => {
    const setdef: ISetDef = await this.getSetDef(set, configpath);
    const setlist = await this.fetchPages(setdef.mdsource);
    return await this.fetchImages(setdef, setlist);
  }

  /**
   * checks setlist against files in target folder and outputs an array of missing ones
   * @param set
   * @param configpath
   */
  public check = async (set: string, configpath: string): Promise<string[]> => {
    const setdef: ISetDef = await this.getSetDef(set, configpath);
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
   * returns undefined when setdef can be retrieved
   * @param {string} set - The Name of the set
   * @param {string} configpath - A path or URL to the set definition
   */
  private getSetDef = async (set: string, configpath: string): Promise<ISetDef> => {
    let setdef: ISetDef;
    let sources = {};
    try {
      sources = JSON.parse(fs.readFileSync(configpath, "utf8"));
    } catch (err) {
      console.log(`No valid config json found @ ${configpath}`);
    }
    if (!sources[set]) {
      try {
        const res = await axios.get(configpath, { headers: { Accept: "application/json" } });
        if ( res.data[set] ) {
          setdef = res.data[set];
          console.log(`set definition "${set}" fetched from URL`);
        }
      } catch (err) {
        console.log(`"${err.input}" was neither a valid set reference nor a valid URL!`);
      }
    } else {
      setdef = sources[set];
      console.log(`set definition "${set}" parsed from JSON-file`);
    }
    return setdef;
  }

  /**
   * gets setlist from solr
   * @param mdsource
   */
  private fetchPages = async (mdsource: IMdsource): Promise<Array<Record<any, any>>> => {
    console.log(`fetching metadata from ${mdsource.baseurl}.`);
    const initial = await axios.get(mdsource.baseurl, { params: mdsource.parameters});
    const resultSet: Array<Record<any, any>> = [];
    let i: number = Math.floor( this.getDescendantProp(this.cleanObjectKeys(initial.data), mdsource.rescountpath) / mdsource.parameters.limit);
    console.log(`Query matches ${this.getDescendantProp(this.cleanObjectKeys(initial.data), mdsource.rescountpath) } resources.`);
    while ( i > 0) {
      const page = await axios.get(mdsource.baseurl, { params: { ...mdsource.parameters, page: i } });
      const pagedata = this.getDescendantProp(this.cleanObjectKeys(page.data), mdsource.recsetpath);
      console.log(`${i} pages left.`);
      resultSet.push(...pagedata);
      i--;
    }
    return(resultSet);
  }

  /**
   * runs through a retrieved query set, checks if a thumbnail is already present and tries all sources
   * provided if it isn't. Returns a list of retrieved images;
   * @param setdef
   * @param setlist
   */
  private fetchImages = async (setdef: ISetDef, setlist: Array<Record<any, any>>): Promise<string[]> => {
    console.log(`fetching images`);
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

  /**
   * http request wrapper parsing dynamic parameters from imgsource config according to a specific query item
   * @param imgsource
   * @param setitem
   */
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

  private interpolateTemplateString = (params: Record<any, any>, s: string): any => {
    const names = Object.keys(params);
    const vals = Object.values(params);
    return new Function(...names, `return \`${s}\`;`)(...vals);
  }

  private getDescendantProp = (obj: Record<any, any>, desc: string): any => {
    return desc.replace(/\[([^\[\]]*)\]/g, ".$1.")
        .split(".")
        .reduce((prev, cur) => prev && prev[cur], obj);
  }

  private cleanObjectKeys = (obj: Record<any, any>): Record<any, any> => {
    const res = {};
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === "object" && !Array.isArray(obj[key])) {
        res[key.replace(/[|&;$%@."<>()+,/\\:#]/g, "")] = this.cleanObjectKeys(obj[key]);
      } else { res[key.replace(/[|&;$%@."<>()+,/\\:#]/g, "")] = obj[key]; }
    }
    return res;
  }

}

export const instance = new Main();
