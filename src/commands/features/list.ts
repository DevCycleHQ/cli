import { fetchFeatures } from '../../api/features'
import Base from '../base'

export default class ListFeatures extends Base {
    static hidden = false
    static description = 'View all features in a project'
    authRequired = true

    public async run(): Promise<void> {
        const { flags } = await this.parse(ListFeatures)
        const { project, headless } = flags
        await this.requireProject(project, headless)
        const features = await fetchFeatures(this.authToken, this.projectKey)
        const featureKeys = features.map((feature) => feature.key)
        this.writer.showResults(featureKeys)
    }
}
