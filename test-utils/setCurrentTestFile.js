"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.setCurrentTestFile = void 0;
/**
 * When creating a snapshot the testFile name is incorrect
 * Use this in a beforeEach to set the correct file name
 */
const setCurrentTestFile = (filename) => function () {
    if (this.currentTest) {
        this.currentTest.file = filename;
    }
};
exports.setCurrentTestFile = setCurrentTestFile;
//# sourceMappingURL=setCurrentTestFile.js.map