import chalk from 'chalk'
import { togglebot, togglebotSleep, togglebotWink } from './togglebot'

export default class Writer {
    public successMessage(message: string): void {
        if (!this.headless) console.log(chalk.green(`✅ ${message}`))
    }

    public failureMessage(message: string): void {
        if (!this.headless) console.log(chalk.red(`❌ ${message}`))
    }

    public warningMessage(message: string): void {
        if (!this.headless) console.log(chalk.yellow(`⚠️ ${message}`))
    }

    public statusMessage(message: string): void {
        if (!this.headless) console.log(chalk.dim(`🤖 ${message}`))
    }

    public infoMessage(message: string): void {
        if (!this.headless) console.log((`🤖 ${message}`))
    }

    public title(message: string): void {
        if (!this.headless) console.log((`🤖 ${chalk.bold(message)}`))
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
        if (!this.headless) console.log(list.length ? `${list.join('\n\r')}` : '(Empty)')
    }

    public blankLine(): void {
        if (!this.headless) console.log('\n\r')
    }

    public divider(): void {
        if (!this.headless) console.log('----------------------------------------')
    }

    public showResults(results: unknown): void {
        if (this.headless) {
            console.log(JSON.stringify(results))
        } else {
            console.log(JSON.stringify(results, null, 2))
        }
    }

    public showRawResults(results: string): void {
        console.log(results)
    }

    public showTogglebot(): void {
        if (!this.headless) console.log(togglebot)
    }

    public showTogglebotWink(): void {
        if (!this.headless) console.log(togglebotWink)
    }

    public showTogglebotSleep(): void {
        if (!this.headless) console.log(togglebotSleep)
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