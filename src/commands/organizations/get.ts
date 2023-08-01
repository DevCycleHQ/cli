import { fetchOrganizations } from '../../api/organizations'
import Base from '../base'

export default class DetailedOrganizations extends Base {
    static hidden = false
    static description = 'Retrieve Organizations available to the current user'

    userAuthRequired = true

    public async run(): Promise<void> {
        const orgs = await fetchOrganizations(this.personalAccessToken)
        return this.writer.showResults(orgs.map(({ id, name, display_name }) => ({
            id, name, display_name
        })))
    }
}
