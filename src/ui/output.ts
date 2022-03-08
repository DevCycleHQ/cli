import chalk from 'chalk'

export function successMessage(message:string):void {
    console.log(chalk.green(`✅ ${message}`))
}