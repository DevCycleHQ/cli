import { ux } from '@oclif/core'

export default class TableOutput {
    public headless: boolean
    private overridesColumns = {
        featureName: { header: 'Feature', minWidth: 20 },
        environmentName: { header: 'Environment', minWidth: 20 },
        variationName: { header: 'Override Variation', minWidth: 20 },
    }

    public async print<T extends Record<string, unknown>>(
        data: T[],
        columns: any,
        options?: any,
    ) {
        if (this.headless) {
            return
        }

        try {
            const { printTable } = await import('@oclif/table')
            printTable({ data, columns, ...options })
        } catch (error) {
            // Fallback to basic console.table if @oclif/table is not available
            console.table(data)
        }
        console.log('\r')
    }

    public async printOverrides<T extends Record<string, unknown>>(
        data: T[],
        options?: any,
    ) {
        await this.print(data, this.overridesColumns, options)
    }
}
