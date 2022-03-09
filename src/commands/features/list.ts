import { fetchFeatures } from '../../api/features'
import { showResults } from '../../ui/output'
import Base from '../base'

export default class ListFeatures extends Base {
    static hidden = false
    authRequired = true

    public async run(): Promise<void> {
        await this.requireProject()
        const features = await fetchFeatures(this.token, this.projectKey)
        const featureKeys = features.map((feature) => feature.key)
        showResults(featureKeys)
    }
}