import { HookFunction } from 'mocha'

/**
 * When creating a snapshot the testFile name is incorrect
 * Use this in a beforeEach to set the correct file name
 */
export const setCurrentTestFile = (filename: string): HookFunction =>
    function (this: any) {
        // Mocha path
        if (this && this.currentTest && typeof this.currentTest === 'object') {
            this.currentTest.file = filename
            return
        }
        // Vitest path: no-op, Vitest manages snapshot paths differently
    }
