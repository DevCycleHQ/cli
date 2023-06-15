import Enquirer from 'enquirer'
import { Project } from '../api/schemas'

export async function promptForProject(projects: Project[]): Promise<Project> {
    const projectIdMap: Record<string, Project> = {}
    const projectOptions = projects.map((project) => {
        projectIdMap[project._id] = project
        return {
            name: project.name,
            value: project._id
        }
    })
    const responses = await new Enquirer<{project: string}>().prompt([{
        name: 'project',
        message: 'Which project do you want to use?',
        type: 'autocomplete',
        choices: projectOptions
    }])

    return projectIdMap[responses.project]
}