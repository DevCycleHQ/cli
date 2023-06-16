import inquirer from 'inquirer'
import autocompletePrompt from 'inquirer-autocomplete-prompt'
import fuzzy from 'fuzzy'

inquirer.registerPrompt('autocomplete', autocompletePrompt)

export function autocompleteSearch
    <T extends Record<string, unknown>>(choices: T[], search: string, searchField?: string) : T[] {
    const results = search ? fuzzy.filter(search, choices, {
        extract: (choice) => (choice[searchField || 'name'] as string),
        pre: '\u001b[1m', post: '\u001b[22m' // highlight matching characters
    }).map((result) => ({ 
        ...result.original, 
        [searchField || 'name']: result.string // replace name with highlighted string
    })) : choices

    return results
}

export default inquirer
