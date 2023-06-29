import { fetchFeatures } from '../../api/features'
import Base from '../base'

export default class ListFeatures extends Base {
    static hidden = false
    authRequired = true

    public async run(): Promise<void> {
        if (this.checkAuthExpired()) {
            return
        }
        await this.requireProject()
        const features = await fetchFeatures(this.authToken, this.projectKey)
        const featureKeys = features.map((feature) => feature.key)
        this.writer.showResults(featureKeys)
    }
}
