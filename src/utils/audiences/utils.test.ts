import { expect } from '@oclif/test'
import { buildAudienceNameMap, replaceAudienceIdInFilter } from '.'
import { Audience, FeatureConfig, Filter, AudienceMatchFilter } from '../../api/schemas'

describe('Audience Utils Test', () => {

    const audiences = [
        {
            _id: '1',
            name: 'Audience 1'
        },
        {
            _id: '2',
            name: 'Audience 2'
        },
    ]
    const filters = [
        {
            'type': 'audienceMatch',
            '_audiences': [
                '1'
            ],
            'comparator': '='
        },
        {
            'type': 'user',
            'subType': 'email',
            'values': [
                'new@email.com'
            ],
            'comparator': '='
        }
    ]
    const audienceNameMap = buildAudienceNameMap(audiences as Audience[])

    it('should build a map of audience ids to audience names', () => {
        expect(audienceNameMap).to.deep.equal({
            '1': 'Audience 1',
            '2': 'Audience 2'
        })
    })

    it('should replace audience ids with audience names', async () => {
        const replacedIdFilter = 
            replaceAudienceIdInFilter(filters[0] as AudienceMatchFilter, audienceNameMap) as AudienceMatchFilter
        expect(replacedIdFilter._audiences).to.deep.equal(['Audience 1'])
    })

    it('should not replace audience ids if no audience found', async () => {
        const noneReplacedIdFilter = 
            replaceAudienceIdInFilter(filters[0] as AudienceMatchFilter, {}) as AudienceMatchFilter
        expect(noneReplacedIdFilter._audiences).to.deep.equal(['1'])
    })
})