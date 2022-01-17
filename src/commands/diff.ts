import {Command, Flags} from '@oclif/core'

export default class Diff extends Command {
  static description = 'Print a diff of DevCycle variable usage between two versions of your code.'

  static examples = [
    '<%= config.bin %> <%= command.id %>',
  ]

  static flags = {}

  static args = [{name: 'base'}, {name: 'compare'}]

  public async run(): Promise<void> {
    const {args, flags} = await this.parse(Diff)

    const { base, compare } = args
  }
}
