import { ux } from '@oclif/core'
import Table from 'cli-table3'

export default class TableOutput {
    public headless: boolean
    private overridesColumns = {
        featureName: { header: 'Feature', minWidth: 20 },
        environmentName: { header: 'Environment', minWidth: 20 },
        variationName: { header: 'Override Variation', minWidth: 20 },
    }

    public print<T extends Record<string, unknown>>(
        data: T[],
        columns: Record<string, any>,
        options?: any,
    ) {
        if (this.headless) {
            return
        }

        // Convert to cli-table3 format
        const headers = Object.keys(columns).map(
            (key) => columns[key].header || key,
        )
        const table = new Table({
            head: headers,
            colWidths: Object.keys(columns).map(
                (key) => columns[key].minWidth || columns[key].width,
            ),
            ...options,
        })

        // Add rows
        data.forEach((row) => {
            const rowData = Object.keys(columns).map((key) =>
                String(row[key] || ''),
            )
            table.push(rowData)
        })

        console.log(table.toString())
        console.log('\r')
    }

    public printOverrides<T extends Record<string, unknown>>(
        data: T[],
        options?: any,
    ) {
        this.print(data, this.overridesColumns, options)
    }
}
