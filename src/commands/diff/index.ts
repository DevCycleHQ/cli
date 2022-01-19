import { executeDiff } from '../../utils/diff/diff'
import { Command, Flags } from '@oclif/core'
import { executeFileDiff } from '../../utils/diff/fileDiff'
import { parseFiles } from '../../utils/diff/parse'

export default class Diff extends Command {
    static description = 'Print a diff of DevCycle variable usage between two versions of your code.'

    static examples = [
        '<%= config.bin %> <%= command.id %>',
    ]

    static flags = {
        file: Flags.string({ char: 'f', description: 'File path of existing diff file to inspect' }),
    }

    static args = [
        { name: 'diff-pattern', description: 'A "git diff"-compatible diff pattern, eg. "branch1 branch2"' },
    ]

    public async run(): Promise<void> {
        const { args, flags } = await this.parse(Diff)

        if (!flags.file && !args['diff-pattern']) {
            throw new Error('Must provide a diff pattern')
        }

        const parsedDiff = flags.file ? executeFileDiff(flags.file) : executeDiff(args['diff-pattern'])

        const matches = parseFiles(parsedDiff)

        this.log(JSON.stringify(matches))
    }
}
