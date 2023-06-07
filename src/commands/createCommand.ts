import { Flags } from '@oclif/core'
import { ClassConstructor, plainToClass } from 'class-transformer'
import { validateSync } from 'class-validator'
import inquirer from 'inquirer'
import { reportValidationErrors } from '../utils/reportValidationErrors'
import Base from './base'

type prompts = {
    name: string; message: string; type: string;
}

export default abstract class CreateCommand<ResourceType> extends Base {
    prompts: prompts[] = []
    authRequired = true

    static flags = {
        ...Base.flags,
        'key': Flags.string({
            description: 'Unique ID'
        }),
        'name': Flags.string({
            description: 'Human readable name',
        }),
        'description': Flags.string({
            description: 'Description for the dashboard',
        }),
    }

    public async populateParameters(
        paramClass: ClassConstructor<ResourceType>,
        requireProject = true,
        flags: Record<string, unknown> = {},
    ): Promise<ResourceType> {
        this.filterPrompts(flags)
        if (requireProject) {
            await this.requireProject()
        }
        if (flags.headless) {
            const params = plainToClass(paramClass, flags)
            const errors = validateSync(params as Record<string, unknown>, {
                whitelist: true,
            })
            reportValidationErrors(paramClass.name, errors)
            return params
        }
        const answers = await this.populateParametersWithInquirer()

        const params = plainToClass(paramClass, this.mergeFlagsAndAnswers(flags, answers))
        const errors = validateSync(params as Record<string, unknown>, {
            whitelist: true,
        })
        reportValidationErrors(paramClass.name, errors)
        return params
    }

    private async populateParametersWithInquirer() {
        return await inquirer.prompt(this.prompts, {
            token: this.authToken,
            projectKey: this.projectKey,
        })
    }

    private async filterPrompts(flags: Record<string, unknown>) {
        Object.keys(flags).forEach((key) => {
            if (flags[key]) {
                this.prompts = this.prompts.filter((prompt) => prompt.name !== key)
            }
        })
    }

    private mergeFlagsAndAnswers(flags: Record<string, unknown>, answers: Record<string, unknown>) {
        Object.keys(flags).forEach((key) => {
            if (flags[key] === undefined) {
                flags[key] = answers[key]
            }
        })
        return flags
    }
}
