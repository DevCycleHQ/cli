import chalk from 'chalk'
import { togglebot, togglebotSleep, togglebotWink } from './togglebot'

export default class Writer {
    public successMessage(message: string): void {
        if (!this.headless) console.error(chalk.green(`✅ ${message}`))
    }

    public failureMessage(message: string): void {
        if (!this.headless) console.error(chalk.red(`❌ ${message}`))
    }

    public warningMessage(message: string): void {
        if (!this.headless) console.error(chalk.yellow(`⚠️ ${message}`))
    }

    public statusMessage(message: string): void {
        if (!this.headless) console.error(chalk.dim(`🤖 ${message}`))
    }

    public infoMessage(message: string): void {
        if (!this.headless) console.error(`🤖 ${message}`)
    }

    public infoMessageWithCommand(message: string, command: string): void {
        if (!this.headless) console.error(`🤖 ${message} ${chalk.bold(command)}`)
    }

    public title(message: string): void {
        if (!this.headless) console.error(`🤖 ${chalk.bold(message)}`)
    }

    public printCurrentValues(values: unknown): void {
        if (!this.headless) {
            this.blankLine()
            this.infoMessage('Current values:')
            this.infoMessage(JSON.stringify(values, null, 2))
            this.blankLine()
        }
    }

    public list(list: string[]): void {
        if (!this.headless)
            console.error(list.length ? `${list.join('\n\r')}` : '(Empty)')
    }

    public blankLine(): void {
        if (!this.headless) console.error('\n\r')
    }

    public divider(): void {
        if (!this.headless)
            console.error('----------------------------------------')
    }

    public showResults(results: unknown): void {
        if (this.headless) {
            console.error(JSON.stringify(results))
        } else {
            console.error(JSON.stringify(results, null, 2))
        }
    }

    public showRawResults(results: string): void {
        console.error(results)
    }

    public showTogglebot(): void {
        if (!this.headless) console.error(togglebot)
    }

    public showTogglebotWink(): void {
        if (!this.headless) console.error(togglebotWink)
    }

    public showTogglebotSleep(): void {
        if (!this.headless) console.error(togglebotSleep)
    }

    public showError(message: string): void {
        if (this.headless) {
            console.error(message)
        } else {
            console.error(chalk.red(`❌ ${message}`))
        }
    }

    public headless: boolean
}
