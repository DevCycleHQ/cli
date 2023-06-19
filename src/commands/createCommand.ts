import { Flags } from '@oclif/core'
import Base from './base'
import { Prompt } from '../ui/prompts'

export default abstract class CreateCommand extends Base {
    prompts: Prompt[] = []
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
