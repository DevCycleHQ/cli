"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeFileDiff = void 0;
const tslib_1 = require("tslib");
const parse_diff_1 = (0, tslib_1.__importDefault)(require("parse-diff"));
const fs = (0, tslib_1.__importStar)(require("fs"));
const executeFileDiff = (filePath) => {
    const result = fs.readFileSync(filePath, 'utf8');
    return (0, parse_diff_1.default)(result);
};
exports.executeFileDiff = executeFileDiff;
