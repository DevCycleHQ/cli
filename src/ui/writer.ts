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

    public blankLine(): void {
        if (!this.headless) console.log('\n\r')
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
        console.log(chalk.red(`❌ ${message}`))
    }

    public headless: boolean
}