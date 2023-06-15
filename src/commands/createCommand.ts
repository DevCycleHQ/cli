import { Flags } from '@oclif/core'
import Base from './base'

export default abstract class CreateCommand extends Base {
    authRequired = true

    static flags = {
        ...Base.flags,
        'key': Flags.string({
            description: 'Unique ID'
        }),
        'name': Flags.string({
            description: 'Human readable name',
        }),
    }
}
