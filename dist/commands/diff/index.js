"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const diff_1 = require("../../utils/diff/diff");
const core_1 = require("@oclif/core");
const fileDiff_1 = require("../../utils/diff/fileDiff");
const parse_1 = require("../../utils/diff/parse");
class Diff extends core_1.Command {
    async run() {
        const { args, flags } = await this.parse(Diff);
        if (flags.file) {
            const diff = (0, fileDiff_1.executeFileDiff)(flags.file);
            (0, parse_1.parseFiles)(diff);
            return;
        }
        const parsedDiff = (0, diff_1.executeDiff)(args['diff-pattern']);
        (0, parse_1.parseFiles)(parsedDiff);
        // TODO use parsedDiff to find variables
    }
}
exports.default = Diff;
Diff.description = 'Print a diff of DevCycle variable usage between two versions of your code.';
Diff.examples = [
    '<%= config.bin %> <%= command.id %>',
];
Diff.flags = {
    file: core_1.Flags.string({ char: 'f', description: 'File path of existing diff file to inspect' })
};
Diff.args = [
    { name: 'diff-pattern', description: 'A "git diff"-compatible diff pattern, eg. "branch1 branch2"' }
];
