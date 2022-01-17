import { executeDiff } from '../../utils/diff'
import { Command } from '@oclif/core'

export default class Diff extends Command {
    static description = 'Print a diff of DevCycle variable usage between two versions of your code.'

    static examples = [
        '<%= config.bin %> <%= command.id %>',
    ]

    static flags = {}

    static args = [
        {name: 'diff-pattern', description: 'A "git diff"-compatible diff pattern, eg. "branch1 branch2"', required: true}
    ]

    public async run(): Promise<void> {
        const {args, flags} = await this.parse(Diff)

        const parsedDiff = executeDiff(args['diff-pattern'])

        // TODO use parsedDiff to find variables
    }
}
