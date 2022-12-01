import { default as sources } from "./config/sources";
import { ISetDef } from "./setdef.interface";
import axios from "axios";
import * as fs from "fs";

export class Main {
  public fetch = async (set: string) => {
    if (!sources()[set]) {
      console.error(`Set "${set}" is not defined.`);
    }
    console.log(`Processing set "${set}"`);
    const setdef: ISetDef = sources()[set];
    const setlist = await this.fetchPages(setdef);
    const filelist = this.getFileList(setdef.target);
    console.log(setlist, filelist);
  }

  private fetchPages = async (setdef: ISetDef): Promise<Array<Record<any, any>>> => {
    const initial = await axios.get(setdef.vufind.baseurl, { params: setdef.vufind.parameters});
    const resultSet: Array<Record<any, any>> = [];
    let i: number = Math.floor(initial.data.resultCount / setdef.vufind.parameters.limit);
    while ( i > 0) {
      const page = await axios.get(setdef.vufind.baseurl, { params: { ...setdef.vufind.parameters, page: i } });
      console.log(`${i} pages left.`);
      resultSet.push(...page.data.records);
      i--;
    }
    return(resultSet);
  }

  private getFileList = async (path: string): Promise<string[]> => {
    const filelist: string[] = [];
    try {
      filelist.push(...fs.readdirSync(path));
    } catch (err) {
      console.log(err);
    }
    return filelist;
  }
}

export const instance = new Main();
