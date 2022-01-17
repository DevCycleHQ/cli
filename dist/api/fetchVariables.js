"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchVariableKeys = void 0;
const tslib_1 = require("tslib");
const axios_1 = (0, tslib_1.__importDefault)(require("axios"));
const common_1 = require("./common");
const fetchVariableKeys = async (token, project_id) => {
    const url = new URL(`/v1/projects/${project_id}/variables`, common_1.BASE_URL);
    const response = await axios_1.default.get(url.href, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token
        }
    });
    return response.data.map((variable) => variable.key);
};
exports.fetchVariableKeys = fetchVariableKeys;
