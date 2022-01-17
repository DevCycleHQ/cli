"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFiles = void 0;
const nodejs_1 = require("./parsers/nodejs");
const PARSERS = {
    js: [nodejs_1.parseFile]
};
const parseFiles = (files) => {
    var _a, _b, _c;
    var _d;
    const resultsByLanguage = {};
    for (const file of files) {
        const parsers = PARSERS[(_b = (_a = file.to) === null || _a === void 0 ? void 0 : _a.split('.').pop()) !== null && _b !== void 0 ? _b : ""] || [];
        for (const parser of parsers) {
            const result = parser.parse(file);
            (_c = resultsByLanguage[_d = parser.identity]) !== null && _c !== void 0 ? _c : (resultsByLanguage[_d] = []);
            resultsByLanguage[parser.identity].push(...result);
        }
    }
    return resultsByLanguage;
};
exports.parseFiles = parseFiles;
