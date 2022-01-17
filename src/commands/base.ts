import {Command, Flags} from '@oclif/core'
import {authenticate} from '../api/authenticate'

export default abstract class Base extends Command {
    static flags = {
      client_id: Flags.string({char: 'c', description: 'DevCycle Client Id', required: true}),
      client_secret: Flags.string({char: 's', description: 'DevCycle Client Secret', required: true}),
      project: Flags.string({char: 'p', description: 'Project identifier (id or key)', required: true}),
    }

    token: string | null = null

    async init() {
      const {flags} = await this.parse(this.constructor as typeof Base)
      this.token = await authenticate(flags.client_id, flags.client_secret)
    }
}
