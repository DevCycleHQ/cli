import { fetchProjects } from "../../api/projects"
import { promptForProject } from "../../ui/promptForProject"

import Base from "../base"
export default class ListVariables extends Base {
    static hidden = false
    authRequired = true

    public async run(): Promise<void> {
        const projects = await fetchProjects(this.token)
        const selected = await promptForProject(projects)
        await this.updateConfig({project:selected.key})
    }
}