import { Project } from '../api/schemas'
import inquirer, { autocompleteSearch } from './autocomplete'

export async function promptForProject(projects: Project[]): Promise<Project> {
    const projectIdMap: Record<string, Project> = {}
    const projectOptions = projects.map((project) => {
        projectIdMap[project._id] = project
        return {
            name: project.name,
            value: project._id,
        }
    })

    const responses = await inquirer.prompt([
        {
            name: 'project',
            message: 'Which project do you want to use?',
            type: 'autocomplete',
            source: (_input: never, search: string) =>
                autocompleteSearch(projectOptions, search),
        },
    ])

    return projectIdMap[responses.project]
}
