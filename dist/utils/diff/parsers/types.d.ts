import parse from 'parse-diff'
export declare type Parser = {
    parse: (files: parse.File) => string[];
    identity: string;
};
