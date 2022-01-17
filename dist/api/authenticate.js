"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const tslib_1 = require("tslib");
const axios_1 = (0, tslib_1.__importDefault)(require("axios"));
const common_1 = require("./common");
const authenticate = async (client_id, client_secret) => {
    const url = new URL("/oauth/token", common_1.AUTH_URL);
    const response = await axios_1.default.post(url.href, {
        grant_type: "client_credentials",
        client_id,
        client_secret,
        audience: "https://api.devcycle.com",
    });
    return response.data.access_token;
};
exports.authenticate = authenticate;
