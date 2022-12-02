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
    const filelist = this.getFileList(setdef.target);
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
