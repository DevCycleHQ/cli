import inquirer from "inquirer";
import { Project } from "../api/projects";

export async function promptForProject(projects:Project[]):Promise<Project> {
    const projectOptions = projects.map((project) => {
        return {
            name: project.name,
            value: project
        }
    })
    let responses: any = await inquirer.prompt([{
        name: 'project',
        message: 'Which project do you want to use?',
        type: 'list',
        choices: projectOptions
    }])
    return responses.project
}