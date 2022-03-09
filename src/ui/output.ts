import chalk from 'chalk'

export function successMessage(message:string):void {
    console.log(chalk.green(`✅ ${message}`))
}

export function showResults(results:unknown) {
    console.log(JSON.stringify(results, null, 2))
}