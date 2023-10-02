import chalk from 'chalk'
import { fetchProjects } from '../../api/projects'
import Base from '../base'

export default class ListProjects extends Base {
    static aliases: string[] = ['projects:ls']
    static description = 'List the keys of all projects in the current Organization'
    static hidden = false
    authRequired = true

    public async run(): Promise<void> {
        const projects = await fetchProjects(this.authToken)
        const projectsKeys = projects.map((project) => {
            if (project.key === this.projectKey) {
                return chalk.green(`  "${project.key}"`)
            }
            return `  "${project.key}"`
        })
        const projectsString = `[\n${projectsKeys.join(',\n')}\n]`
        return this.writer.showRawResults(projectsString)
    }
}
