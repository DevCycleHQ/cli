"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@oclif/core");
const authenticate_1 = require("../api/authenticate");
class Base extends core_1.Command {
    constructor() {
        super(...arguments);
        this.token = null;
    }
    async init() {
        const { flags } = await this.parse(this.constructor);
        this.token = await (0, authenticate_1.authenticate)(flags.client_id, flags.client_secret);
    }
}
exports.default = Base;
Base.flags = {
    client_id: core_1.Flags.string({ char: 'c', description: 'DevCycle Client Id', required: true }),
    client_secret: core_1.Flags.string({ char: 's', description: 'DevCycle Client Secret', required: true }),
    project: core_1.Flags.string({ char: 'p', description: 'Project identifier (id or key)', required: true }),
};
