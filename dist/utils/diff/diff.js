"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeDiff = void 0;
const tslib_1 = require("tslib");
const child_process_1 = require("child_process");
const parse_diff_1 = (0, tslib_1.__importDefault)(require("parse-diff"));
const executeDiff = (diffCommand) => {
    const result = (0, child_process_1.execSync)(`git diff ${diffCommand}`);
    return (0, parse_diff_1.default)(result.toString());
};
exports.executeDiff = executeDiff;
