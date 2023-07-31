import { fetchOrganizations } from '../../api/organizations'
import Base from '../base'

export default class ListOrganizations extends Base {
    static description = 'List the keys of all organizations available to the current user'
    static hidden = false

    userAuthRequired = true

    public async run(): Promise<void> {
        const orgs = await fetchOrganizations(this.personalAccessToken)
        return this.writer.showResults(orgs.map((orgs) => orgs.name))
    }
}
