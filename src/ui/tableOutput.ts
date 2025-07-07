import { ux } from '@oclif/core'
import { table } from '@oclif/core/lib/cli-ux/styled/table'

export default class TableOutput {
    public headless: boolean
    private overridesColumns = {
        featureName: { header: 'Feature', minWidth: 20 },
        environmentName: { header: 'Environment', minWidth: 20 },
        variationName: { header: 'Override Variation', minWidth: 20 },
    }

    public print<T extends Record<string, unknown>>(
        data: T[],
        columns: table.Columns<T>,
        options?: table.Options,
    ) {
        if (this.headless) {
            return
        }

        ux.table(data, columns, options)
        console.log('\r')
    }

    public printOverrides<T extends Record<string, unknown>>(
        data: T[],
        options?: table.Options,
    ) {
        this.print(data, this.overridesColumns, options)
    }
}
