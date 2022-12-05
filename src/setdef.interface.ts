import {IMdsource} from "./mdsource.interface";
import {IImgsource} from "./imgsource.interface";
export interface ISetDef extends Record<string, any> {
    mdsource: IMdsource;
    imgsource: IImgsource[];
    target: string;
}
