export interface ISetDef extends Record<string, any> {
    vufind: {
        baseurl: string;
        parameters: {
            "field[]": string[];
            "filter[]": string[];
            limit: number;
        };
    };
    images: {
        baseurl: string;
        parameters: Record<string, string[]>;
    };
    target: string;
}
