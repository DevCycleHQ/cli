import chalk from 'chalk'

export function successMessage(message:string):void {
    console.log(chalk.green(`✅ ${message}`))
}

export function failureMessage(message:string):void {
    console.log(chalk.red(`❌ ${message}`))
}

export function statusMessage(message:string):void {
    console.log(chalk.yellow(`🤖 ${message}`))
}

export function showResults(results:unknown):void {
    console.log(JSON.stringify(results, null, 2))
}