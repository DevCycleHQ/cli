import chalk from 'chalk'

export function successMessage(message:string) {
    console.log(chalk.green(`✅ ${message}`))
}