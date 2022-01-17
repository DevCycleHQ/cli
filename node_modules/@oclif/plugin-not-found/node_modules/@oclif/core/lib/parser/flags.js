"use strict";
// tslint:disable interface-over-type-literal
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultFlags = exports.string = exports.option = exports.url = exports.integer = exports.boolean = exports.build = void 0;
const url_1 = require("url");
function build(defaults) {
    return (options = {}) => {
        return {
            parse: async (i, _) => i,
            ...defaults,
            ...options,
            input: [],
            multiple: Boolean(options.multiple),
            type: 'option',
        };
    };
}
exports.build = build;
function boolean(options = {}) {
    return {
        parse: async (b, _) => b,
        ...options,
        allowNo: Boolean(options.allowNo),
        type: 'boolean',
    };
}
exports.boolean = boolean;
exports.integer = build({
    parse: async (input) => {
        if (!/^-?\d+$/.test(input))
            throw new Error(`Expected an integer but received: ${input}`);
        return Number.parseInt(input, 10);
    },
});
/**
 * Initializes a string as a URL. Throws an error
 * if the string is not a valid URL.
 */
exports.url = build({
    parse: async (input) => {
        try {
            return new url_1.URL(input);
        }
        catch {
            throw new Error(`Expected a valid url but received: ${input}`);
        }
    },
});
function option(options) {
    return build(options)();
}
exports.option = option;
const stringFlag = build({});
exports.string = stringFlag;
exports.defaultFlags = {
    color: boolean({ allowNo: true }),
};
