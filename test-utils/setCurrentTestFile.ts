import { HookFunction } from 'mocha'

/**
 * When creating a snapshot the testFile name is incorrect
 * Use this in a beforeEach to set the correct file name
 */
export const setCurrentTestFile = (filename: string): HookFunction => (
    function(this: Mocha.Context) {
        if (this.currentTest) {
            this.currentTest.file = filename
        }
    }
)