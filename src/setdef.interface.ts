export interface ISetDef extends Record<string, any> {
    mdsource: {
        baseurl: string;
        parameters: {
            "field[]": string[];
            "filter[]": string[];
            limit: number;
        };
        rescountpath: string;
        recsetpath: string;
    };
    imgsource: {
        baseurl: string;
        parameters: Record<string, any>;
    };
    target: string;
}
