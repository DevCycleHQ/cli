"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseFile = void 0;
const findVariableRegex = /dvcClient\.variable\((?:\w|\s)*,\s*(?:"|')(.*)(?:"|')/;
exports.parseFile = {
    parse: (file) => {
        const results = [];
        for (const chunk of file.chunks) {
            for (const change of chunk.changes) {
                const match = findVariableRegex.exec(change.content);
                if (match) {
                    results.push(match[1]);
                }
            }
        }
        return results;
    },
    identity: 'nodejs'
};
