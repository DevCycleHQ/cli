import { Command } from '@oclif/core'
import { togglebotWink } from '../ui/togglebot'

export default class Wink extends Command {
    static hidden=true

    async run(): Promise<void> {
        console.log(togglebotWink)   
    }
}